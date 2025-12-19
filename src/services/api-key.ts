import { Like } from 'typeorm';
import { APP_CONSTANTS } from '../constants';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, generateBytes } from '../helpers';
import { CacheKeyGenerator } from '../helpers/cache';
import { ApiKeyRepository } from '../repositories';
import {
  DtoApiKeyGenerate,
  DtoApiKeyList,
  DtoApiKeyReset,
  DtoApiKeyToggle,
  DtoApiKeyUpdate,
  IApiKey,
  TApiKeyServiceCheck,
} from '../types';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';
import { KeyService } from './key';

export class ApiKeyService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly appService: AppService,
    private readonly keyService: KeyService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService
  ) {}

  public async validate(dto: TApiKeyServiceCheck) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        publicKey: dto.publicKey,
        type: dto.type,
        active: true,
      },
    });

    if (!apiKey) throw new Exception(EResponseStatus.NotFound, EErrorCode.KEY_NOT_EXIST);

    return this.keyService.verify(apiKey.keyId);
  }

  public async toggle(dto: DtoApiKeyToggle) {
    const apiKey = await this.getById(dto.id);

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const updateApiKey: Partial<IApiKey> = {};

    updateApiKey.active = !apiKey.active;
    updateApiKey.revokedAt = updateApiKey.active ? null : new Date();

    await this.apiKeyRepository.update(
      {
        id: dto.id,
        appId: app.id,
      },
      updateApiKey
    );

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));

    return { ...dto, type: apiKey.type, active: updateApiKey.active };
  }

  public async generate(dto: DtoApiKeyGenerate) {
    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const systemConfig = await this.configService
      .getSystemConfig({
        API_KEY_GENERATE_DURATION_AMOUNT: 'number',
        API_KEY_GENERATE_DURATION_UNIT: 'dateUnit',
      })
      .allowNull([]);

    const { keyId } = await this.keyService.getRotateKey({
      type: this.keyTypeString(dto.code, dto.namespace, dto.type),
      options: {
        bytes: dto.length,
        onGenerateDuration: {
          amount: systemConfig.API_KEY_GENERATE_DURATION_AMOUNT,
          unit: systemConfig.API_KEY_GENERATE_DURATION_UNIT,
        },
      },
    });

    if (!dto.publicKeyLength) {
      throw new Exception(
        EResponseStatus.BadRequest,
        EErrorCode.PUBLIC_KEY_LENGTH_IS_NOT_CONFIGURATED
      );
    }

    const apiKeyInstance = this.apiKeyRepository.create({
      appId: app.id,
      keyId,
      publicKey: generateBytes(dto.publicKeyLength),
      description: dto.description,
      type: dto.type,
      active: true,
    });

    const saved = await this.apiKeyRepository.save(apiKeyInstance);

    return saved;
  }

  public async list(dto: DtoApiKeyList) {
    const cacheKey = CacheKeyGenerator.apiKeyList(dto.code);
    const cached = await this.cacheService.get<IApiKey[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.apiKeyRepository.find({
      where: {
        app: {
          code: Like(`%${dto.code}%`),
        },
      },
      order: {
        type: 'ASC',
      },
    });

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }

  public async reset(dto: DtoApiKeyReset) {
    const apiKey = await this.getById(dto.id);

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const { keyId } = await this.keyService.generate({
      type: this.keyTypeString(dto.code, dto.namespace, apiKey.type),
      useRotate: true,
      bytes: dto.length,
    });

    await this.apiKeyRepository.update(
      { id: dto.id },
      {
        keyId,
        active: true,
      }
    );

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));

    return { ...apiKey, keyId };
  }

  public async update(dto: DtoApiKeyUpdate) {
    const apiKey = await this.getById(dto.id);

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    if (dto.isDelete) {
      await this.apiKeyRepository.softDelete({ id: dto.id });

      await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
      return true;
    }

    const updateData = {
      ...apiKey,
      description: dto.description,
    };

    await this.apiKeyRepository.update({ id: dto.id }, updateData);

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
    return true;
  }

  public async getById(id: string) {
    const apiKey = await this.apiKeyRepository.findOneBy({ id });
    if (!apiKey) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APIKEY_NOT_EXIST);
    }

    return apiKey;
  }

  public async getByApp(appId: string) {
    return this.apiKeyRepository.find({ where: { appId } });
  }

  private keyTypeString(code: string, namespace: string, type: string) {
    return APP_CONSTANTS.FORMATS.keyType.apiKey(code, namespace, type);
  }
}
