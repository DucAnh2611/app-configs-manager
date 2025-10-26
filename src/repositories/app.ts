import { Repository } from 'typeorm';
import { AppDataSource, AppEntity } from '../db';
import { IApp } from '../types';

export type AppRepository = Repository<IApp>;

export const appRepository = AppDataSource.getRepository(AppEntity);
