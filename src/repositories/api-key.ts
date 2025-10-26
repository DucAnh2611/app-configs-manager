import { Repository } from 'typeorm';
import { ApiKeyEntity, AppDataSource } from '../db';
import { IApiKey } from '../types';

export type ApiKeyRepository = Repository<IApiKey>;

export const apiKeyRepository = AppDataSource.getRepository(ApiKeyEntity);
