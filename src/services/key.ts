import dayjs, { ManipulateType } from 'dayjs';
import { Not } from 'typeorm';
import { KEY_CONSTANTS } from '../constants';
import { ECacheKey, EErrorCode, EKeyStatus, EResponseStatus } from '../enums';
import {
  bindStringFormat,
  CacheKeyGenerator,
  Exception,
  generateBytes,
  getFileDir,
  hash,
  promiseAll,
  readContentFile,
  slug,
  valueOrDefault,
  verify,
  writeContentFile,
} from '../helpers';
import { KeyRepository } from '../repositories';
import { IKey, TKeyServiceGenerate, TKeyServiceGetRotateKey } from '../types';
import { CacheService } from './cache';
import { ConfigService } from './config';

export class KeyService {
  constructor(
    private readonly keyRepository: KeyRepository,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {}

  public async getRotateKey(dto: TKeyServiceGetRotateKey) {
    const safeType = this.safeType(dto.type);
    const key = await this.keyRepository.findOne({
      where: {
        type: safeType,
        ...(dto.version
          ? {
              version: dto.version,
            }
          : {
              status: EKeyStatus.ACTIVE,
            }),
      },
    });

    if (!key) return this.generate({ type: safeType, useRotate: true, bytes: dto.bytes });

    const originKey = await this.getOriginKey(key);

    return { key: originKey, version: key.version, keyId: key.id };
  }

  public async generate(dto: TKeyServiceGenerate) {
    const safeType = this.safeType(dto.type);
    const [currentVersion, { key, hashedKey, hashedBytes }, systemConfig] = await promiseAll(
      this.getVersion(safeType),
      this.genSecretKey(dto.bytes),
      this.configService.getSystemConfig()
    );

    const expire = dayjs().add(
      Number(
        valueOrDefault<number>(
          systemConfig['SECRET_HASH_KEY_ROTATE_TIME'],
          KEY_CONSTANTS.DEFAULT_VALUES.SECRET_HASH_KEY_ROTATE_TIME
        )
      ),
      valueOrDefault<ManipulateType>(
        systemConfig['SECRET_HASH_KEY_ROTATE_UNIT'],
        KEY_CONSTANTS.DEFAULT_VALUES.SECRET_HASH_KEY_ROTATE_UNIT as ManipulateType
      )
    );

    const keyInstance = this.keyRepository.create({
      version: currentVersion + 1,
      type: safeType,
      hashBytes: hashedBytes,
      hashed: hashedKey,
      status: EKeyStatus.ACTIVE,
      expireAt: dto.useRotate ? expire.toDate() : null,
    });

    const savedKey = await this.keyRepository.save(keyInstance);
    await this.saveFile(savedKey, key, keyInstance.expireAt);

    await promiseAll(
      this.updateKeyStatus(currentVersion, safeType, EKeyStatus.INACTIVE),
      this.cacheService.set(
        CacheKeyGenerator.custom(ECacheKey.KEY, safeType, savedKey.version),
        key
      )
    );

    const [_start, _end, originKey] = key;

    return { key: originKey, version: savedKey.version, keyId: savedKey.id };
  }

  public async verify(keyId: string) {
    const { hashedKey, originKey } = await this.getKeyFromId(keyId);

    return verify(originKey, hashedKey);
  }

  private async getKeyFromId(id: string, regenerate?: boolean) {
    const key = await this.keyRepository.findOne({
      where: {
        id,
      },
    });

    if (!key) throw new Exception(EResponseStatus.NotFound, EErrorCode.KEY_NOT_EXIST);

    const originKey = await this.getOriginKey(key, regenerate);

    return { originKey, hashedKey: key.hashed };
  }

  private async regenerate(savedKey: IKey) {
    const { key, hashedKey, hashedBytes } = await this.genSecretKey();

    await this.keyRepository.update(
      {
        id: savedKey.id,
      },
      {
        hashBytes: hashedBytes,
        hashed: hashedKey,
      }
    );

    return await this.saveFile(savedKey, key, savedKey.expireAt);
  }

  private async genSecretKey(bytes?: number) {
    const systemConfig = await this.getSystemConfigKey();

    const key = generateBytes(bytes ?? systemConfig.keyBytes);
    const hashedKey = hash(key, { length: systemConfig.hashKeyBytes });

    return { key: key, hashedKey: hashedKey, hashedBytes: systemConfig.hashKeyBytes };
  }

  private async getVersion(safeType: string) {
    const currentVersion = await this.keyRepository.findOne({
      where: {
        type: safeType,
      },
      order: {
        version: 'DESC',
      },
    });

    return currentVersion?.version ?? 0;
  }

  private async updateKeyStatus(version: number, safeType: string, status: EKeyStatus) {
    return await this.keyRepository.update(
      {
        version,
        type: safeType,
        status: Not(status),
      },
      {
        status,
      }
    );
  }

  private async saveFile(savedKey: IKey, key: string, expire: Date | null) {
    const filePath = this.getFileDir(savedKey);

    const [start, end] = [
      dayjs().toISOString(),
      valueOrDefault(expire?.toISOString(), KEY_CONSTANTS.not_expire),
    ];

    const writeContent = await writeContentFile(
      filePath,
      bindStringFormat(KEY_CONSTANTS.keyLineFormat, {
        start,
        end,
        key,
      }),
      { replace: true }
    );

    if (!writeContent) {
      await this.keyRepository.delete({ id: savedKey.id });

      throw new Exception(EResponseStatus.InternalServerError, EErrorCode.KEY_GENERATE_ERROR);
    }

    return [start, end, key];
  }

  private async getKey(key: IKey) {
    const cache = await this.cacheService.get<string>(
      CacheKeyGenerator.custom(ECacheKey.KEY, key.type, key.version)
    );

    if (cache) return cache.split('|');

    const keyFilePath = this.getFileDir(key);
    const keyContent = await readContentFile(keyFilePath);

    const splited = keyContent.split('|');

    if (splited.length !== KEY_CONSTANTS.keyLineFormat.split('|').length) return null;

    await this.cacheService.set(
      CacheKeyGenerator.custom(ECacheKey.KEY, key.type, key.version),
      keyContent
    );

    return splited;
  }

  private async getOriginKey(key: IKey, regenerate: boolean = false) {
    if (key.status === EKeyStatus.RETIRED)
      throw new Exception(EResponseStatus.Forbidden, EErrorCode.KEY_EXPIRED);

    let keyRaw = await this.getKey(key);
    if (!keyRaw) {
      if (!regenerate) throw new Exception(EResponseStatus.Forbidden, EErrorCode.KEY_EXPIRED);
      keyRaw = await this.regenerate(key);
    }

    const [start, end, originKey] = keyRaw;

    if (end !== KEY_CONSTANTS.not_expire && dayjs(end).diff(dayjs()) <= 0) {
      await this.updateKeyStatus(key.version, key.type, EKeyStatus.RETIRED);
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.KEY_EXPIRED);
    }

    if (dayjs(start).diff(dayjs()) >= 0) {
      await this.updateKeyStatus(key.version, key.type, EKeyStatus.RETIRED);
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.KEY_INVALID_NOT_START);
    }

    return originKey;
  }

  private async getSystemConfigKey() {
    const systemConfig = await this.configService.getSystemConfig();

    return {
      keyBytes: Number(
        systemConfig['SECRET_KEY_BYTES'] ?? KEY_CONSTANTS.DEFAULT_VALUES.SECRET_KEY_BYTES
      ),
      hashKeyBytes: Number(
        systemConfig['SECRET_HASH_KEY_BYTES'] ?? KEY_CONSTANTS.DEFAULT_VALUES.SECRET_HASH_KEY_BYTES
      ),
    };
  }

  private getFileDir(savedKey: IKey) {
    return getFileDir(
      bindStringFormat(KEY_CONSTANTS.fileFormat, {
        type: savedKey.type,
        version: savedKey.version,
      })
    );
  }

  private safeType(type: string) {
    return slug(type);
  }
}
