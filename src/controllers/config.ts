import { ConfigService } from '../services';
import {
  TConfigServiceGet,
  TConfigServiceHistory,
  TConfigServiceRemove,
  TConfigServiceRollback,
  TConfigServiceToggleUse,
  TConfigServiceUp,
} from '../types';

export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  public async history(dto: TConfigServiceHistory) {
    return await this.configService.history(dto);
  }

  public async up(dto: TConfigServiceUp) {
    return await this.configService.up(dto);
  }

  public async get(dto: TConfigServiceGet) {
    return await this.configService.get(dto);
  }

  public async toggleUse(dto: TConfigServiceToggleUse) {
    return await this.configService.toggleUse(dto);
  }

  public async remove(dto: TConfigServiceRemove) {
    return await this.configService.remove(dto);
  }

  public async rollback(dto: TConfigServiceRollback) {
    return await this.configService.rollback(dto);
  }
}
