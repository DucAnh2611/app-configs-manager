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
  @IsString()
  namespace: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  publicKey: string;

  @IsNotEmpty()
  @IsEnum(EApiKeyType)
  type: EApiKeyType;
}

export class DtoApiKeyToggle {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoApiKeyGenerate {
  @IsNotEmpty()
  @IsString()
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

  @IsNotEmpty()
  @IsString()
  namespace: string;
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

  @IsNotEmpty()
  @IsString()
  namespace: string;
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
