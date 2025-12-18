import { In } from 'typeorm';
import { EErrorCode, EResponseStatus } from '../enums';
import { CacheKeyGenerator, Exception, promiseAll } from '../helpers';
import { AppRepository } from '../repositories';
import { DtoAppCreate, DtoAppDelete, DtoAppDetail, DtoAppUpdate } from '../types';
import { CacheService } from './cache';
import { ConfigService } from './config';

export class AppService {
  constructor(
    private readonly appRepository: AppRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService
  ) {}

  public async find() {
    const cacheKey = CacheKeyGenerator.appList();
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const result = await this.appRepository.find({
      select: { id: true, code: true, name: true, createdAt: true, updatedAt: true },
    });

    await this.cacheService.set(cacheKey, result);
    return result;
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
      code: AppService.safeCode(code),
      name,
    });

    await this.configService.up({
      appId: saved.id,
      appCode: saved.code,
      configs: {},
      appNamespace: dto.namespace,
    });

    await this.cacheService.delete(CacheKeyGenerator.appList());
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
        code: AppService.safeCode(code),
        name,
      }
    );

    if (saved.affected) {
      await promiseAll([
        this.cacheService.delete(CacheKeyGenerator.appList()),
        this.cacheService.delete(CacheKeyGenerator.appDetail(dto.id)),
      ]);
    }

    return !!saved.affected;
  }

  public async delete(dto: DtoAppDelete) {
    const deleted = await this.appRepository.softDelete({
      id: In(dto.ids),
    });

    if (deleted.affected && deleted.affected > 0) {
      await promiseAll([
        this.cacheService.delete(CacheKeyGenerator.appList()),
        ...dto.ids.map((id) => this.cacheService.delete(CacheKeyGenerator.appDetail(id))),
      ]);
    }

    return deleted.affected === dto.ids.length;
  }

  public getByCode(code: string) {
    return this.appRepository.findOneBy({
      code: AppService.safeCode(code),
    });
  }

  public getById(id: string) {
    return this.appRepository.findOneBy({ id });
  }

  public static safeCode(code: string) {
    return code.replace(new RegExp(' '), '_').toUpperCase().trim();
  }
}
