import { WebhookRepository } from "../repositories/webhook";
import { AppService } from "./app";
import {
    DtoWebhookDelete, DtoWebhookList, DtoWebhookRegister, DtoWebhookToggle, DtoWebhookReceive, DtoWebhookUpdate
} from "../types"
import { IWebhook } from "../db";

export class WebhookService {
    constructor (
        private readonly webhookRepository: WebhookRepository,
        private readonly appService: AppService,
    ) {}

    public async getById(id: string) {
        return this.webhookRepository.findOneBy({id})
    }

    public async register(dto:DtoWebhookRegister) {
        const app = await this.appService.getByCode(dto.appCode);
        if (!app) {
            throw new Error("App not exsist");
        }
        const saved = await this.webhookRepository.save({
            appId: app.id,
            url: dto.url,
            secret: dto.secret,
            description: dto.description,
            active: true,
        })
        return saved;
    }

    public async update(dto: DtoWebhookUpdate) {
        const webhook = await this.getById(dto.id);
        if (!webhook) {
            throw new Error("webhook not exsist");
        }

        const app = await this.appService.getByCode(dto.appCode);
        if (!app) {
            throw new Error("App not exsist");
        }

        const updateData = {
            ...webhook,
            url: dto.url || webhook.url,
            secret: dto.secret || webhook.secret,
            description: dto.description || webhook.description,
            active: dto.isActive !== undefined ? Boolean(dto.isActive) : webhook.active,
        }

        await this.webhookRepository.update({
            id: dto.id
        }, updateData);

        return true;
    }


    public async list(dto: DtoWebhookList) {
        return this.webhookRepository.findAndCount({
            where: {
                app: {
                    code: dto.appCode,
                }
            }
        })
    }

    public async toggle(dto: DtoWebhookToggle) {
        const webhook = await this.getById(dto.id);
        if (!webhook) {
            throw new Error("webhook not exsist");
        };

        const app = await this.appService.getByCode(dto.appCode);
        if (!app) {
            throw new Error("App not exsist");
        }
        const updateWebhook:Partial<IWebhook> = {};
        updateWebhook.active = !webhook.active;

        const toggled = await this.webhookRepository.update({
            id: dto.id
        }, updateWebhook);

        return {...dto, active: updateWebhook.active};
    }


    public async delete(dto: DtoWebhookDelete) {
        const webhook = await this.getById(dto.id);
        if (!webhook) {
            throw new Error("webhook not exsist");
        };

        const app = await this.appService.getByCode(dto.appCode);
        if (!app) {
            throw new Error("App not exsist");
        }

        await this.webhookRepository.softDelete({id: dto.id});
        return true;
    }

    public async processWebhook(dto:DtoWebhookReceive) {
        const app = await this.appService.getByCode(dto.appCode);
        if (!app) {
            throw new Error('App not found');
        }

        console.log('Processing webhook for app:', dto.appCode, 'event:', dto.eventType);
        return { success: true, eventType: dto.eventType };
    }
} 