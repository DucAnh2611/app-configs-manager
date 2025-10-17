import { Type } from "class-transformer";
import {
    IsNotEmpty, IsOptional, IsString, IsUUID, IsObject,
    IsBoolean
} from "class-validator"

export class DtoWebhookRegister {
    @IsNotEmpty()
    @IsUUID()
    appCode: string;

    @IsNotEmpty()
    @IsString()
    url: string;

    @IsNotEmpty()
    @IsString()
    secret: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class DtoWebhookUpdate {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsUUID()
    appCode: string;

    @IsOptional()
    @IsString()
    url?: string;

    @IsOptional()
    @IsString()
    secret?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: Boolean
}

export class DtoWebhookList {
    @IsNotEmpty()
    @IsUUID()
    appCode: string;
}

export class DtoWebhookToggle {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsUUID()
    appCode: string;
}

export class DtoWebhookDelete {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsUUID()
    appCode: string;
}

export class DtoWebhookReceive {
    @IsNotEmpty()
    @IsString()
    eventType: string;

    @IsOptional()
    @IsObject()
    payload?: Record<string, any>;

    @IsNotEmpty()
    @IsUUID()
    appCode: string;
}
