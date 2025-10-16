import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class DtoConfigGet {}

export class DtoConfigUp {
  @IsNotEmpty()
  @IsUUID()
  appId: string;

  @IsNotEmpty()
  @IsObject()
  configs: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  namespace: string;

  @IsNotEmpty()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsBoolean()
  isUse: boolean = false;
}
