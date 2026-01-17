import { Not } from 'typeorm';
import { EErrorCode, EKeyStatus, EResponseStatus } from '../enums';
import { Exception, slug } from '../helpers';
import { KeyRepository } from '../repositories';
import {
  IKey,
  TKeyGenerateDuration,
  TKeyServiceGenerate,
  TKeyserviceGetOriginKeyResult,
  TKeyServiceGetRotateKey,
} from '../types';
import { km } from 'key-rotation-manager';

export class KeyService {
  private readonly keyManager = km({ quiet: true });

  constructor(private readonly keyRepository: KeyRepository) {}

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
      hashBytes,
    } = await this.getOriginKey(key, {
      ...dto.options,
      useRotateKey: true,
    });

    return { key: originKey, version: keyVersion, keyId, expiredKey, hashBytes };
  }

  public async generate(dto: TKeyServiceGenerate) {
    const safeType = this.safeType(dto.type);

    if (dto.useRotate && !dto.duration) {
      throw new Exception(
        EResponseStatus.InternalServerError,
        EErrorCode.KEY_GENERATE_ROTATE_MISSING_DURATION
      );
    }

    const newKey = await this.keyManager.newKey({
      type: safeType,
      duration: dto.duration?.amount,
      unit: dto.duration?.unit,
      rotate: dto.useRotate,
      keyLength: dto.bytes,
    });

    const keyInstance = this.keyRepository.create({
      version: String(newKey.key.version),
      type: safeType,
      hashed: newKey.key.hashed,
      hashBytes: newKey.key.hashedBytes,
      path: newKey.path,
      rotate: !!dto.useRotate,
      status: EKeyStatus.ACTIVE,
      expireAt: newKey.key.to,
      durationAmount: dto.useRotate && dto.duration ? dto.duration.amount : null,
      durationUnit: dto.useRotate && dto.duration ? dto.duration.unit : null,
    });

    const savedKey = await this.keyRepository.save(keyInstance);

    const currentVersion = await this.getVersion(safeType);
    if (currentVersion !== '')
      await this.updateKeyStatus(currentVersion, safeType, EKeyStatus.INACTIVE);

    return {
      key: newKey.key.key,
      version: savedKey.version,
      keyId: savedKey.id,
      hashBytes: savedKey.hashBytes,
      expiredKey: null,
    };
  }

  public async verify(keyId: string) {
    const { hashedKey, path, version } = await this.getKeyFromId(keyId);

    return this.keyManager.verifyKey(hashedKey, path, version);
  }

  private async getKeyFromId(id: string) {
    let key = await this.keyRepository.findOne({
      where: {
        id,
      },
    });

    if (!key) throw new Exception(EResponseStatus.NotFound, EErrorCode.KEY_NOT_EXIST);

    return { path: key.path, version: key.version, hashedKey: key.hashed };
  }

  private async getVersion(safeType: string) {
    const currentVersion = await this.keyRepository.findOne({
      where: {
        type: safeType,
        status: EKeyStatus.ACTIVE,
      },
    });

    return currentVersion?.version ?? '';
  }

  private async updateKeyStatus(version: string, safeType: string, status: EKeyStatus) {
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

  private async getOriginKey(
    key: IKey,
    options: {
      renewOnExpire?: boolean;
      onGenerateDuration?: TKeyGenerateDuration;
      useRotateKey?: boolean;
      bytes?: number | null;
    } = {}
  ): Promise<TKeyserviceGetOriginKeyResult> {
    let getKey = await this.keyManager.getKey({
      path: key.path,
      version: String(key.version),
      onRotate:
        options.renewOnExpire && options.onGenerateDuration
          ? {
              duration: options.onGenerateDuration.amount,
              unit: options.onGenerateDuration.unit,
              rotate: true,
              keyLength: options.bytes ?? undefined,
            }
          : undefined,
    });

    return {
      key: getKey.ready!.key,
      version: key.version,
      id: key.id,
      expiredKey: getKey.expired,
      hashBytes: getKey.ready!.hashedBytes,
    };
  }

  private safeType(type: string) {
    return slug(type);
  }
}
