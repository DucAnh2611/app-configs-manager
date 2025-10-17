import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';

export class DtoConfigHistory {
  @IsNotEmpty()
  @IsString()
  namespace: string;
}

export class DtoConfigGet {
  @IsNotEmpty()
  @IsString()
  namespace: string;
}

export class DtoConfigUp {
  @IsNotEmpty()
  @IsObject()
  configs: Record<string, any>;

  @IsNotEmpty()
  @IsString()
  namespace: string;
}

export class DtoConfigToggleUse {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoConfigRemove {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DtoConfigRollback {
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
