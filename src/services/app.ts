import { In } from 'typeorm';
import {
  DtoAppCreate,
  DtoAppDelete,
  DtoAppDetail,
  DtoAppGetConfigs,
  DtoAppUpConfig,
  DtoAppUpdate,
} from '../types';
import { AppRepository } from '../repositories';
import { EAppConfigsUpdateType } from '../enums';
import { APP_CONSTANTS } from '../constants';

export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  public async getConfigs(dto: DtoAppGetConfigs) {
    const app = await this.getByCode(dto.code);
    if (!app) {
      throw new Error('Not exist!');
    }

    return app.configs;
  }

  public async upConfig(code: string, dto: DtoAppUpConfig) {
    const app = await this.getByCode(code);
    if (!app) {
      throw new Error('Not exist!');
    }

    const { configs, mode } = dto;
    let updateConfigs = app.configs;

    switch (mode) {
      case EAppConfigsUpdateType.HARD:
        updateConfigs = configs;
        break;

      case EAppConfigsUpdateType.SOFT:
        updateConfigs = {
          ...updateConfigs,
          ...configs,
        };
        break;

      default:
        break;
    }

    await this.appRepository.update(
      {
        id: app.id,
      },
      {
        configs: {
          ...APP_CONSTANTS.DEFAULT_CONFIGS,
          ...updateConfigs,
        },
      }
    );

    return updateConfigs;
  }

  public async find() {
    return await this.appRepository.find({
      select: { id: true, code: true, name: true, createdAt: true, updatedAt: true },
    });
  }

  public async detail(dto: DtoAppDetail) {
    const isExist = await this.getById(dto.id);
    if (!isExist) {
      throw new Error('Not exist!');
    }

    return this.appRepository.findOne({
      where: {
        id: dto.id,
      },
      relations: {
        configs: true,
      },
      select: {
        id: true,
        code: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        configs: false,
        apiKeys: false,
      },
    });
  }

  public async create(dto: DtoAppCreate) {
    const isExist = await this.getByCode(dto.code);
    if (isExist) {
      throw new Error('Existed!');
    }

    const { code, name } = dto;

    const saved = await this.appRepository.save({
      code: this.safeCode(code),
      name,
      configs: APP_CONSTANTS.DEFAULT_CONFIGS,
    });

    return saved;
  }

  public async update(dto: DtoAppUpdate) {
    const isExist = await this.getById(dto.id);
    if (!isExist) {
      throw new Error('Not exist!');
    }

    const { id, code = isExist.code, name = isExist.name } = dto;

    const isExistedCode = await this.getByCode(code);
    if (isExistedCode) {
      throw new Error('Existed!');
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
