import { Like } from 'typeorm';
import { IApiKey } from '../db';
import { formatString, generateBytes, hash, signJwt, verify, verifyJwt } from '../helpers';
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
import { ApiKeyRepository } from '../repositories';
import { EApiKeyType, EAppConfigsUpdateType } from '../enums';

export class ApiKeyService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly appService: AppService
  ) {}

  public async validate(dto: DtoApiKeyValidate) {
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
        return true;
      }
    }

    return false;
  }

  public async toggle(dto: DtoApiKeyToggle) {
    const apiKey = await this.getById(dto.id);
    if (!apiKey) {
      throw new Error('ApiKey not exist!');
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Error('App not exist!');
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

    return { ...dto, type: apiKey.type, active: updateApiKey.active };
  }

  public async generate(dto: DtoApiKeyGenerate): Promise<IApiKey & { formattedKey: string }> {
    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Error('App not exist!');
    }

    const key = generateBytes(Number(dto.length));

    const { PUBLIC_KEY_LENGTH = null, JWT_SECRET_API_KEY } = await this.appService.getConfigs({
      code: dto.code,
    });

    if (dto.type === EApiKeyType.THIRD_PARTY && !PUBLIC_KEY_LENGTH) {
      throw new Error("Public key length haven't configured!");
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
        },
        JWT_SECRET_API_KEY
      ),
    };
  }

  public async list(dto: DtoApiKeyList) {
    return this.apiKeyRepository.find({
      where: {
        app: {
          code: Like(`%${dto.code}%`),
        },
      },
      order: {
        type: 'ASC',
      },
    });
  }

  public async reset(dto: DtoApiKeyReset) {
    const apiKey = await this.getById(dto.id);
    if (!apiKey) {
      throw new Error('ApiKey not exist!');
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Error('App not exist!');
    }

    const key = generateBytes(Number(dto.length));

    const { JWT_SECRET_API_KEY } = await this.appService.getConfigs({
      code: dto.code,
    });

    await this.apiKeyRepository.update(
      { id: dto.id },
      {
        key: hash(key, Number(dto.length)),
        active: true,
      }
    );

    return {
      ...apiKey,
      formattedKey: signJwt<TJwtApiKeyPayload>(
        {
          appCode: app.code,
          key: key,
          type: apiKey.type,
        },
        JWT_SECRET_API_KEY
      ),
    };
  }

  public async update(dto: DtoApiKeyUpdate) {
    const apiKey = await this.getById(dto.id);
    if (!apiKey) {
      throw new Error('ApiKey not exist!');
    }

    const app = await this.appService.getByCode(dto.code);
    if (!app) {
      throw new Error('App not exist!');
    }

    if (dto.isDelete) {
      await this.apiKeyRepository.softDelete({ id: dto.id });
      return true;
    }

    const updateData = {
      ...apiKey,
      description: dto.description,
    };

    await this.apiKeyRepository.update({ id: dto.id }, updateData);
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

  public async extractPayload(token: string, code: string): Promise<TJwtApiKeyPayload | null> {
    const { JWT_SECRET_API_KEY } = await this.appService.getConfigs({
      code: code,
    });

    return verifyJwt<TJwtApiKeyPayload>(token, JWT_SECRET_API_KEY);
  }
}
