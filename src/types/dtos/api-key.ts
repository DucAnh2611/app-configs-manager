import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { EApiKeyType } from '../../enums';

export class DtoApiKeyValidate {
  @IsNotEmpty()
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
  @IsNumber()
  @IsInt()
  @Max(128)
  @Min(0)
  length: number;

  @IsNumber()
  @IsInt()
  @Max(128)
  @Min(0)
  publicKeyLength: number;

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
  @IsNumber()
  @IsInt()
  @Max(128)
  @Min(0)
  length: number;

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
  keyId: string;
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
