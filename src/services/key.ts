import dayjs from 'dayjs';
import { Not } from 'typeorm';
import { CACHE_CONSTANTS, KEY_CONSTANTS } from '../constants';
import { ECacheKey, EErrorCode, EKeyBytesMode, EKeyStatus, EResponseStatus } from '../enums';
import {
  attachField,
  bindStringFormat,
  CacheKeyGenerator,
  Exception,
  generateBytes,
  getFileDir,
  hash,
  promiseAll,
  randNumber,
  readContentFile,
  slug,
  valueOrDefault,
  verify,
  writeContentFile,
} from '../helpers';
import { KeyRepository } from '../repositories';
import {
  IKey,
  TKeyGenerateDuration,
  TKeyServiceGenerate,
  TKeyserviceGetOriginKeyResult,
  TKeyServiceGetRotateKey,
} from '../types';
import { processConditions } from '../utils';
import { CacheService } from './cache';

export class KeyService {
  constructor(
    private readonly keyRepository: KeyRepository,
    private readonly cacheService: CacheService
  ) {}

  public async getRotateKey(dto: TKeyServiceGetRotateKey) {
    const safeType = this.safeType(dto.type);
    const key = await this.keyRepository.findOne({
      where: {
        type: safeType,
        ...(dto.options?.version
          ? {
              version: dto.options?.version,
              status: Not(EKeyStatus.RETIRED),
            }
          : {
              status: EKeyStatus.ACTIVE,
            }),
      },
    });

    if (!key)
      return this.generate({
        type: safeType,
        useRotate: true,
        duration: dto.options.onGenerateDuration,
        bytes: dto.options.bytes,
      });

    const {
      key: originKey,
      version: keyVersion,
      id: keyId,
      expiredKey,
    } = await this.getOriginKey(key, { ...dto.options, useRotateKey: true });

    return { key: originKey, version: keyVersion, keyId, hashBytes: key.hashBytes, expiredKey };
  }

  public async generate(dto: TKeyServiceGenerate) {
    const safeType = this.safeType(dto.type);
    const [currentVersion, { key, hashedKey }] = await promiseAll(
      this.getVersion(safeType),
      this.genSecretKey(dto.bytes)
    );

    if (dto.useRotate && !dto.duration) {
      throw new Exception(
        EResponseStatus.InternalServerError,
        EErrorCode.KEY_GENERATE_ROTATE_MISSING_DURATION
      );
    }

    const expire =
      dto.useRotate && dto.duration ? dayjs().add(dto.duration.amount, dto.duration.unit) : null;

    const keyInstance = this.keyRepository.create({
      version: currentVersion + 1,
      type: safeType,
      hashBytes: dto.bytes,
      hashed: hashedKey,
      status: EKeyStatus.ACTIVE,
      expireAt: expire,
      durationAmount: dto.useRotate && dto.duration ? dto.duration.amount : null,
      durationUnit: dto.useRotate && dto.duration ? dto.duration.unit : null,
    });

    const savedKey = await this.keyRepository.save(keyInstance);

    const [_start, _end, originKey] = await this.saveFile(savedKey, key, keyInstance.expireAt);

    await this.updateKeyStatus(currentVersion, safeType, EKeyStatus.INACTIVE);

    return {
      key: originKey,
      version: savedKey.version,
      keyId: savedKey.id,
      hashBytes: dto.bytes,
      expiredKey: null,
    };
  }

  public async verify(keyId: string) {
    const { hashedKey, originKey } = await this.getKeyFromId(keyId);

    return verify(originKey, hashedKey);
  }

  public static getBytes(
    mode: EKeyBytesMode,
    fixedBytes: number,
    randFrom: number | null,
    randTo: number | null,
    randDecimal: number | null
  ) {
    switch (mode) {
      case EKeyBytesMode.FIXED:
        return fixedBytes;
      case EKeyBytesMode.RANDOM:
        return randNumber(
          attachField(
            {},
            { from: randFrom, when: !Number.isNaN(randFrom) },
            { to: randTo, when: !Number.isNaN(randTo) },
            { decimal: randDecimal, when: !Number.isNaN(randDecimal) }
          )
        );
    }
  }

  private async getKeyFromId(id: string) {
    let key = await this.keyRepository.findOne({
      where: {
        id,
      },
    });

    if (!key) throw new Exception(EResponseStatus.NotFound, EErrorCode.KEY_NOT_EXIST);

    const { key: originKey, expiredKey } = await this.getOriginKey(key);

    return { originKey: valueOrDefault(expiredKey?.originKey, originKey), hashedKey: key.hashed };
  }

  private async regenerate(savedKey: IKey) {
    const { key, hashedKey } = await this.genSecretKey(savedKey.hashBytes);

    await this.keyRepository.update(
      {
        id: savedKey.id,
      },
      {
        hashed: hashedKey,
      }
    );
    return await this.saveFile(savedKey, key, savedKey.expireAt);
  }

  private async genSecretKey(bytes: number) {
    const key = generateBytes(randNumber({ from: 32, to: 64, decimal: 0 }));
    const hashedKey = hash(key, { length: bytes });

    return { key: key, hashedKey: hashedKey };
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
    return this.keyRepository.update(
      {
        version,
        type: safeType,
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

    const fileContent = bindStringFormat(KEY_CONSTANTS.keyLineFormat, {
      start,
      end,
      key,
    });

    const writeContent = await writeContentFile(filePath, fileContent, { replace: true });

    if (!writeContent) {
      await this.keyRepository.delete({ id: savedKey.id });

      throw new Exception(EResponseStatus.InternalServerError, EErrorCode.KEY_GENERATE_ERROR);
    }

    await this.cacheService.set(
      CacheKeyGenerator.custom(ECacheKey.KEY, savedKey.type, savedKey.version),
      fileContent,
      CACHE_CONSTANTS.TTL.KEY
    );

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
      keyContent,
      CACHE_CONSTANTS.TTL.KEY
    );

    return splited;
  }

  private async getOriginKey(
    key: IKey,
    options: Partial<{
      renewOnExpire: boolean;
      onGenerateDuration: TKeyGenerateDuration;
      useRotateKey: boolean;
    }> = {}
  ): Promise<TKeyserviceGetOriginKeyResult> {
    const now = dayjs();

    let keyRaw = await this.getKey(key);
    if (!keyRaw) {
      await this.regenerate(key);
      return await this.getOriginKey(key, options);
    }

    const [start, end, originKey] = keyRaw;

    if (
      processConditions({}).or(
        () => end !== KEY_CONSTANTS.not_expire && now.isAfter(end),
        () => key.status === EKeyStatus.RETIRED,
        () => now.isAfter(key.expireAt)
      )
    ) {
      if (!options.renewOnExpire) {
        await this.updateKeyStatus(key.version, key.type, EKeyStatus.RETIRED);
        throw new Exception(EResponseStatus.BadRequest, EErrorCode.KEY_EXPIRED);
      }

      const renew = await this.renewKey(
        key,
        originKey,
        !!options.useRotateKey,
        options.onGenerateDuration
      );
      return renew;
    }

    if (now.isBefore(start)) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.KEY_INVALID_NOT_START);
    }

    return {
      key: originKey,
      version: key.version,
      id: key.id,
      expiredKey: null,
    };
  }

  private async renewKey(
    key: IKey,
    keyExpired: string,
    useRotate: boolean,
    duration?: TKeyGenerateDuration
  ): Promise<TKeyserviceGetOriginKeyResult> {
    const newKey = await this.generate({
      type: key.type,
      bytes: key.hashBytes,
      useRotate,
      duration,
    });

    return {
      key: newKey.key,
      version: newKey.version,
      id: newKey.keyId,
      expiredKey: { id: key.id, originKey: keyExpired },
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
