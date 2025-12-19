import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EAppConfigsUpdateType } from '../../enums';

export class DtoAppDetail {
  @IsUUID()
  id: string;
}

export class DtoAppCreate {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  namespace: string;
}

export class DtoAppUpdate {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class DtoAppDelete {
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}

export class DtoAppGenerateApiKey {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoAppGetConfigs {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class DtoAppUpConfig {
  @IsNotEmpty()
  @IsEnum(EAppConfigsUpdateType)
  mode: EAppConfigsUpdateType;

  @IsNotEmpty()
  @IsObject()
  configs: Record<string, any>;
}
