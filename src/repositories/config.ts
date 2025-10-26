import { Repository } from 'typeorm';
import { AppDataSource, ConfigEntity } from '../db';
import { IConfig } from '../types';

export type ConfigRepository = Repository<IConfig>;

export const configRepository = AppDataSource.getRepository(ConfigEntity);
