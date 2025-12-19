import { Repository } from 'typeorm';
import { AppDataSource, KeyEntity } from '../db';
import { IKey } from '../types';

export type KeyRepository = Repository<IKey>;

export const keyRepository = AppDataSource.getRepository(KeyEntity);
