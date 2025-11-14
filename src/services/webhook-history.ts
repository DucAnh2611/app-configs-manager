import dayjs from 'dayjs';
import { In, IsNull, LessThan, MoreThanOrEqual, Not } from 'typeorm';
import { COMMON_CONFIG } from '../configs';
import { QUEUE_CONSTANTS } from '../constants/queue';
import { EErrorCode, EResponseStatus, EWebhookHistoryStatus } from '../enums';
import {
  convertToDayjs,
  Exception,
  getPaginationQuery,
  getPaginationResponse,
  getSortObject,
} from '../helpers';
import { getAxios } from '../libs';
import { ConfigRepository, WebhookHistoryRepository } from '../repositories';
import {
  IWebhook,
  IWebhookHistory,
  TWebhookHistoryLog,
  TWebhookHistoryServiceCreate,
  TWebhookHistoryServiceList,
  TWebhookHistoryServiceRetry,
  TWebhookHistoryServiceUpdate,
} from '../types';
import { ConfigService } from './config';
import { QueueService } from './queue';

export class WebhookHistoryService {
  constructor(
    private readonly webhookHistoryRepository: WebhookHistoryRepository,
    private readonly configRepository: ConfigRepository,
    private readonly queueService: QueueService
  ) {}

  public async list(payload: TWebhookHistoryServiceList) {
    const order = getSortObject<IWebhook>(payload.sort);

    const [list, total] = await this.webhookHistoryRepository.findAndCount({
      where: {
        status: payload.status || Not(IsNull()),
        webhook: {
          id: payload.webhookId || Not(IsNull()),
          appId: payload.appId,
        },
      },
      select: {
        id: true,
        webhookId: false,
        status: true,
        logs: true,
        data: true,
        isSuccess: true,
        createdAt: true,
        updatedAt: true,
        webhookSnapshot: true,
      },
      ...getPaginationQuery(payload, order),
    });

    return getPaginationResponse(list, payload, order, total);
  }

  public async update(payload: TWebhookHistoryServiceUpdate) {
    const isExist = await this.getById(payload.webhookHistoryId);
    if (!isExist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_HISTORY_NOT_EXIST);
    }

    const updated = await this.webhookHistoryRepository.update(
      { id: payload.webhookHistoryId },
      {
        isSuccess: payload.isSuccess,
        logs: [...isExist.logs, ...payload.logs],
        status: payload.status,
      }
    );

    return !!updated.affected;
  }

  public async create(payload: TWebhookHistoryServiceCreate) {
    const instance = await this.webhookHistoryRepository.create({
      isSuccess: false,
      status: EWebhookHistoryStatus.IN_QUEUE,
      logs: [
        {
          status: EWebhookHistoryStatus.IN_QUEUE,
          timestamp: dayjs().toISOString(),
          detail: 'Created',
        },
      ],
      data: payload.data,
      webhookId: payload.webhookId,
      webhookSnapshot: payload.webhookSnapshot,
    });

    const saved = await this.webhookHistoryRepository.save(instance);

    return saved;
  }

  public async retry(payload: TWebhookHistoryServiceRetry) {
    const isExist: IWebhookHistory | null = await this.getById(payload.webhookHistoryId);
    if (!isExist) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.WEBHOOK_HISTORY_NOT_EXIST);
    }

    const allowes = [EWebhookHistoryStatus.FAILED, EWebhookHistoryStatus.SUCCESS];

    if (!allowes.includes(isExist.status)) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.WEBHOOK_HISTORY_RETRY_NOT_ALLOWED);
    }

    await this.webhookHistoryRepository.update(
      { id: payload.webhookHistoryId },
      {
        isSuccess: isExist.isSuccess,
        logs: [
          ...isExist.logs,
          {
            status: EWebhookHistoryStatus.IN_QUEUE,
            timestamp: dayjs().toISOString(),
            detail: 'Retry',
          },
        ],
        status: EWebhookHistoryStatus.IN_QUEUE,
      }
    );

    return { scheduled: true };
  }

  public async getById(id: string) {
    return this.webhookHistoryRepository.findOne({ where: { id } });
  }

  public async call(queueWebhook: IWebhookHistory) {
    const newLog: TWebhookHistoryLog = {
      status: EWebhookHistoryStatus.PROCESSING,
      timestamp: dayjs().toISOString(),
    };

    try {
      await this.webhookHistoryRepository.update(
        { id: queueWebhook.id, status: EWebhookHistoryStatus.IN_QUEUE },
        {
          logs: [...queueWebhook.logs, newLog],
          status: EWebhookHistoryStatus.PROCESSING,
        }
      );

      const { WEBHOOK_AUTH_HEADER_NAME, WEBHOOK_AUTH_HEADER_FORMAT } = await this.getHeaderConfig(
        COMMON_CONFIG.APP_CODE,
        COMMON_CONFIG.APP_ENV
      );

      const webhookConfig = queueWebhook.webhookSnapshot;

      if (!webhookConfig)
        throw new Exception(
          EResponseStatus.Conflict,
          EErrorCode.WEBHOOK_HISTORY_CALL_MISSING_WEBHOOK_SNAPSHORT
        );

      const axios = getAxios({
        method: webhookConfig.method,
        bodyType: webhookConfig.bodyType,
        options: {
          ...(webhookConfig.authKey
            ? {
                authHeader: {
                  key: webhookConfig.authKey,
                  format: WEBHOOK_AUTH_HEADER_FORMAT,
                  header: WEBHOOK_AUTH_HEADER_NAME,
                },
              }
            : {}),
        },
      });

      const res = await axios({ url: webhookConfig.targetUrl, data: queueWebhook.data });

      await this.update({
        isSuccess: true,
        logs: [
          {
            status: EWebhookHistoryStatus.SUCCESS,
            timestamp: dayjs().toISOString(),
            data: queueWebhook.data,
            detail: res,
          },
        ],
        status: EWebhookHistoryStatus.SUCCESS,
        webhookHistoryId: queueWebhook.id,
      });
    } catch (e) {
      await this.update({
        isSuccess: false,
        logs: [
          {
            status: EWebhookHistoryStatus.FAILED,
            timestamp: dayjs().toISOString(),
            detail: (e as Exception).resJson?.error as EErrorCode,
          },
        ],
        status: EWebhookHistoryStatus.FAILED,
        webhookHistoryId: queueWebhook.id,
      });
    }
  }

  public async clean(processingWebhook: IWebhookHistory[]) {
    if (!processingWebhook.length) return;

    const ids = processingWebhook.map((w) => w.id);
    const newLog: TWebhookHistoryLog = {
      status: EWebhookHistoryStatus.FAILED,
      timestamp: dayjs().toISOString(),
      detail: 'Cleaned up!',
    };

    await this.webhookHistoryRepository
      .createQueryBuilder()
      .update()
      .set({
        status: EWebhookHistoryStatus.FAILED,
        logs: () => `COALESCE(logs, '[]'::jsonb) || '[${JSON.stringify(newLog)}]'::jsonb`,
      })
      .where('id IN (:...ids)', { ids })
      .andWhere('status = :status', { status: EWebhookHistoryStatus.PROCESSING })
      .execute();
  }

  public async registerCall() {
    const { WEBHOOK_HISTORY_CLEAN_UP_PERIOD } = await this.getHeaderConfig(
      COMMON_CONFIG.APP_CODE,
      COMMON_CONFIG.APP_ENV
    );

    const [time, unit] = convertToDayjs(WEBHOOK_HISTORY_CLEAN_UP_PERIOD);

    const list = await this.webhookHistoryRepository.find({
      where: {
        status: EWebhookHistoryStatus.IN_QUEUE,
        updatedAt: MoreThanOrEqual(dayjs().subtract(time, unit).toDate()),
      },
    });

    if (!list.length) return;

    for (const item of list) {
      await this.queueService.addQueue(QUEUE_CONSTANTS.NAME.WEBHOOK_HISTORY_CALL, item);
    }
  }

  public async registerClean() {
    const { WEBHOOK_HISTORY_CLEAN_UP_PERIOD } = await this.getHeaderConfig(
      COMMON_CONFIG.APP_CODE,
      COMMON_CONFIG.APP_ENV
    );

    const [time, unit] = convertToDayjs(WEBHOOK_HISTORY_CLEAN_UP_PERIOD);

    const cleanList = await this.webhookHistoryRepository.find({
      where: {
        status: In([EWebhookHistoryStatus.IN_QUEUE, EWebhookHistoryStatus.PROCESSING]),
        updatedAt: LessThan(dayjs().subtract(time, unit).toDate()),
      },
    });

    if (!cleanList.length) return;

    await this.queueService.addQueue(QUEUE_CONSTANTS.NAME.WEBHOOK_HISTORY_CLEAN, cleanList);
  }

  private async getHeaderConfig(code: string, namespace: string) {
    const config = await this.configRepository.findOne({
      where: {
        app: { code },
        namespace,
        isUse: true,
      },
    });

    if (!config) {
      throw new Exception(EResponseStatus.NotFound, EErrorCode.CONFIG_NOT_EXIST);
    }

    return ConfigService.safeConfig(ConfigService.decryptConfig(config.configs));
  }
}
