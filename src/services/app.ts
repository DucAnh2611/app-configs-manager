import { In } from 'typeorm';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception } from '../helpers';
import { AppRepository } from '../repositories';
import { DtoAppCreate, DtoAppDelete, DtoAppDetail, DtoAppUpdate, IApp, IConfig } from '../types';
import { CacheService } from './cache';
import { ConfigService } from './config';

export class AppService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService
  ) {}

  public async migrationConfig() {
    let page = 1;
    const take = 10;

    const countApps = await this.appRepository
      .createQueryBuilder('app')
      .leftJoin('app.vConfigs', 'vConfig')
      .where('app.deletedAt IS NULL')
      .andWhere((qb) => {
        const subQuery = qb.subQuery().select('vConfig.appId').from('configs', 'vConfig');
        return 'app.id NOT IN ' + subQuery.getQuery();
      })
      .getCount();

    const totalPages = Math.ceil(countApps / take);

    const configs: IConfig[] = [];

    while (page <= totalPages) {
      const migrated = await this.partialMigrateConfig(page, take);
      configs.push(...migrated);

      page++;
    }

    return configs;
  }

  public async partialMigrateConfig(page: number, take: number) {
    const apps: IApp[] = await this.appRepository
      .createQueryBuilder('app')
      .select('app.*')
      .leftJoin('app.vConfigs', 'vConfig')
      .where('app.deletedAt IS NULL')
      .andWhere((qb) => {
        const subQuery = qb.subQuery().select('vConfig.appId').from('configs', 'vConfig');
        return 'app.id NOT IN ' + subQuery.getQuery();
      })
      .take(take)
      .skip((page - 1) * take)
      .execute();

    return this.configService.migrate(apps);
  }

  public async find() {
    return await this.appRepository.find({
      select: { id: true, code: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  public async detail(dto: DtoAppDetail) {
    const isCached = await this.cacheService.get(`${dto.id}_DETAIL_APP`);
    if (isCached) return isCached;

    const isExist = await this.getById(dto.id);
    if (!isExist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const detail = await this.appRepository.findOne({
      where: {
        id: dto.id,
      },
      select: {
        id: true,
        code: true,
        name: true,
        configs: false,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.cacheService.set(`${dto.id}_DETAIL_APP`, detail);

    return detail;
  }

  public async create(dto: DtoAppCreate) {
    const isExist = await this.getByCode(dto.code);
    if (isExist) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.APP_EXISTED);
    }

    const { code, name } = dto;

    const saved = await this.appRepository.save({
      code: this.safeCode(code),
      name,
    });

    await this.configService.up({
      appId: saved.id,
      appCode: saved.code,
      configs: {},
      namespace: dto.namespace,
    });

    return saved;
  }

  public async update(dto: DtoAppUpdate) {
    const isExist = await this.getById(dto.id);
    if (!isExist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.APP_NOT_EXIST);
    }

    const { id, code = isExist.code, name = isExist.name } = dto;

    const isExistedCode = await this.getByCode(code);
    if (isExistedCode) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.APP_EXISTED);
    }

    const saved = await this.appRepository.update(
      {
        id,
      },
      {
        code: this.safeCode(code),
        name,
      }
    );

    return !!saved.affected;
  }

  public async delete(dto: DtoAppDelete) {
    const deleted = await this.appRepository.softDelete({
      id: In(dto.ids),
    });

    return deleted.affected === dto.ids.length;
  }

  public getByCode(code: string) {
    return this.appRepository.findOneBy({
      code: code,
    });
  }

  public getById(id: string) {
    return this.appRepository.findOneBy({ id });
  }

  private safeCode(code: string) {
    return code.replace(new RegExp(' '), '_').toUpperCase().trim();
  }
}
