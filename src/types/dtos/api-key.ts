import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { EApiKeyType } from '../../enums';

export class DtoApiKeyValidate {
  @IsNotEmpty()
  @IsString()
  apiKey: string;

  @IsNotEmpty()
  @IsEnum(EApiKeyType)
  type: EApiKeyType;

  @IsNotEmpty()
  @IsString()
  appCode: string;
}

export class DtoApiKeyToggle {
  @IsNotEmpty()
  @IsUUID()
  code: string;

  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoApiKeyGenerate {
  @IsNotEmpty()
  @IsUUID()
  code: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  length: string;

  @IsNotEmpty()
  @IsEnum(EApiKeyType)
  type: EApiKeyType;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class DtoApiKeyList {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class DtoApiKeyReset {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  length: string;
}

export class DtoApiKeyCheckKeyType {
  @IsNotEmpty()
  @IsEnum(EApiKeyType)
  type: EApiKeyType;

  @IsNotEmpty()
  @IsString()
  appCode: string;

  @IsNotEmpty()
  @IsString()
  key: string;
}

export class DtoApiKeyUpdate {
  @IsNotEmpty()
  @IsBoolean()
  isDelete: boolean;

  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;
}
