import { IsNotEmpty, IsObject, IsString, IsUUID } from 'class-validator';

export class DtoConfigHistory {
  @IsNotEmpty()
  @IsString()
  appCode: string;

  @IsNotEmpty()
  @IsString()
  appNamespace: string;
}

export class DtoConfigGet {
  @IsNotEmpty()
  @IsString()
  appCode: string;

  @IsNotEmpty()
  @IsString()
  appNamespace: string;
}

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
}

export class DtoConfigBulkUp {
  appId: string;
  configs: Record<string, any>;
  namespace: string;
  isUse: boolean = false;
  version: number;
}

export class DtoConfigToggleUse {
  @IsNotEmpty()
  @IsUUID()
  configId: string;
}

export class DtoConfigRemove {
  @IsNotEmpty()
  @IsUUID()
  configId: string;
}

export class DtoConfigRollback {
  @IsNotEmpty()
  @IsUUID()
  configId: string;
}
