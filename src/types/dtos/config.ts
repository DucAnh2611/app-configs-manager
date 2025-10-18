import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';

export class DtoConfigHistory {}

export class DtoConfigGet {}

export class DtoConfigUp {
  @IsNotEmpty()
  @IsObject()
  configs: Record<string, any>;
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
