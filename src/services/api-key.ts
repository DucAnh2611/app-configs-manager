import { Like } from 'typeorm';
import { IApiKey } from '../db';
import { EApiKeyType, EErrorCode, EResponseStatus } from '../enums';
import { Exception, generateBytes, hash, signJwt, verify, verifyJwt } from '../helpers';
import { CacheKeyGenerator } from '../helpers/cache';
import { ApiKeyRepository } from '../repositories';
import {
  DtoApiKeyCheckKeyType,
  DtoApiKeyGenerate,
  DtoApiKeyList,
  DtoApiKeyReset,
  DtoApiKeyToggle,
  DtoApiKeyUpdate,
  DtoApiKeyValidate,
  TJwtApiKeyPayload,
} from '../types';
import { AppService } from './app';
import { CacheService } from './cache';
import { ConfigService } from './config';

export class ApiKeyService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService
  ) {}

  public async validate(dto: DtoApiKeyValidate) {
    const cacheKey = CacheKeyGenerator.apiKeyValidate(dto.appCode, dto.type);
    const cached = await this.cacheService.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const apiKeys = await this.apiKeyRepository.find({
      where: {
        app: {
          code: dto.appCode,
        },
        type: dto.type,
        active: true,
      },
    });

    for (const apiKey of apiKeys) {
      if (verify(dto.apiKey, apiKey.key)) {
        await this.cacheService.set(cacheKey, true, 300);
        return true;
      }
    }

    await this.cacheService.set(cacheKey, false, 300); 
    return false;
  }

  public async toggle(dto: DtoApiKeyToggle) {
    const apiKey = await this.getById(dto.id);
    if (!apiKey) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APIKEY_NOT_EXIST);
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const updateApiKey: Partial<IApiKey> = {};

    updateApiKey.active = !apiKey.active;
    updateApiKey.revokedAt = updateApiKey.active ? null : new Date();

    const toggled = await this.apiKeyRepository.update(
      {
        id: dto.id,
        appId: app.id,
      },
      updateApiKey
    );

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
    await this.cacheService.delete(CacheKeyGenerator.apiKeyValidate(dto.code, apiKey.type));

    return { ...dto, type: apiKey.type, active: updateApiKey.active };
  }

  public async generate(dto: DtoApiKeyGenerate): Promise<IApiKey & { formattedKey: string }> {
    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const key = generateBytes(Number(dto.length));

    const config = await this.configService.get({
      appId: app.id,
      appNamespace: dto.namespace,
    });

    const { JWT_SECRET_API_KEY, PUBLIC_KEY_LENGTH } = config.configs;

    if (dto.type === EApiKeyType.THIRD_PARTY && !PUBLIC_KEY_LENGTH) {
      throw new Exception(
        EResponseStatus.BadRequest,
        EErrorCode.PUBLIC_KEY_LENGTH_IS_NOT_CONFIGURATED
      );
    }

    const saved = await this.apiKeyRepository.save({
      appId: app.id,
      key: hash(key, Number(dto.length)),
      publicKey:
        dto.type === EApiKeyType.THIRD_PARTY ? generateBytes(Number(PUBLIC_KEY_LENGTH)) : null,
      description: dto.description,
      type: dto.type,
      active: true,
    });

    return {
      ...saved,
      formattedKey: signJwt<TJwtApiKeyPayload>(
        {
          appCode: app.code,
          key: key,
          type: dto.type,
          appId: app.id,
        },
        JWT_SECRET_API_KEY
      ),
    };
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
    if (!apiKey) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APIKEY_NOT_EXIST);
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const key = generateBytes(Number(dto.length));

    const config = await this.configService.get({
      appId: app.id,
      appNamespace: dto.namespace,
    });

    const { JWT_SECRET_API_KEY } = config.configs;

    await this.apiKeyRepository.update(
      { id: dto.id },
      {
        key: hash(key, Number(dto.length)),
        active: true,
      }
    );

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
    await this.cacheService.delete(CacheKeyGenerator.apiKeyValidate(dto.code, apiKey.type));

    return {
      ...apiKey,
      formattedKey: signJwt<TJwtApiKeyPayload>(
        {
          appCode: app.code,
          key: key,
          type: apiKey.type,
          appId: app.id,
        },
        JWT_SECRET_API_KEY
      ),
    };
  }

  public async update(dto: DtoApiKeyUpdate) {
    const apiKey = await this.getById(dto.id);
    if (!apiKey) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APIKEY_NOT_EXIST);
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    if (dto.isDelete) {
      await this.apiKeyRepository.softDelete({ id: dto.id });

      await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
      await this.cacheService.delete(CacheKeyGenerator.apiKeyValidate(dto.code, apiKey.type));
      return true;
    }

    const updateData = {
      ...apiKey,
      description: dto.description,
    };

    await this.apiKeyRepository.update({ id: dto.id }, updateData);

    await this.cacheService.delete(CacheKeyGenerator.apiKeyList(dto.code));
    await this.cacheService.delete(CacheKeyGenerator.apiKeyValidate(dto.code, apiKey.type));
    return true;
  }

  public async getById(id: string) {
    return this.apiKeyRepository.findOneBy({ id });
  }

  public async getByApp(appId: string) {
    return this.apiKeyRepository.find({ where: { appId } });
  }

  public async checkKeyType(dto: DtoApiKeyCheckKeyType) {
    const apiKeys = await this.apiKeyRepository.find({
      where: {
        type: dto.type,
        app: {
          code: dto.appCode,
        },
        active: true,
      },
    });

    for (const apiKey of apiKeys) {
      if (verify(dto.key, apiKey.key)) {
        return true;
      }
    }

    return false;
  }

  public async extractPayload(
    token: string,
    code: string,
    namespace: string
  ): Promise<TJwtApiKeyPayload | null> {
    const app = await this.appService.getByCode(code);

    if (!app) return null;

    try {
      const config = await this.configService.get({
        appId: app.id,
        appNamespace: namespace,
      });

      const { JWT_SECRET_API_KEY } = config.configs;

      return verifyJwt<TJwtApiKeyPayload>(token, JWT_SECRET_API_KEY);
    } catch {
      return null;
    }
  }
}
