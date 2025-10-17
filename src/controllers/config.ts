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
    try {
      const data = await this.configService.history(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async up(dto: TConfigServiceUp) {
    try {
      const data = await this.configService.up(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async get(dto: TConfigServiceGet) {
    try {
      const data = await this.configService.get(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async toggleUse(dto: TConfigServiceToggleUse) {
    try {
      const data = await this.configService.toggleUse(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async remove(dto: TConfigServiceRemove) {
    try {
      const data = await this.configService.remove(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async rollback(dto: TConfigServiceRollback) {
    try {
      const data = await this.configService.rollback(dto);

      return {
        status: 200,
        success: true,
        data,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: (error as Error).message,
      };
    }
  }
}
