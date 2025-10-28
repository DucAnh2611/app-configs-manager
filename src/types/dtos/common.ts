import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class DtoSearch {
  @IsOptional()
  @Transform((v) => Number(v.value))
  @IsNumber()
  @IsPositive()
  @IsInt()
  page?: number;

  @IsOptional()
  @Transform((v) => Number(v.value))
  @IsNumber()
  @IsPositive()
  @IsInt()
  size?: number;

  @IsOptional()
  @Transform((v) => String(v.value).trim())
  @IsString()
  sort?: string;
}
