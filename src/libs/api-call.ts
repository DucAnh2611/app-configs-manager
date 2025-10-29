import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { EErrorCode, EResponseStatus, EWebhookBodyType, EWebhookMethod } from '../enums';
import { bindStringFormat, Exception, serialize } from '../helpers';
import { logger } from './logger';

type TOptions = {
  authHeader?: {
    key: string;
    header: string;
    format: string;
  };
};

const defaultOption: Partial<TOptions> = {};

export const getAxios = ({
  method,
  bodyType,
  options = {},
}: {
  method: EWebhookMethod;
  bodyType: EWebhookBodyType | null;
  options?: Partial<TOptions>;
}) => {
  const { authHeader } = Object.assign(options, defaultOption);

  let headers = {};

  if (authHeader) {
    headers = {
      [authHeader.header]: bindStringFormat(authHeader.format, { apikey: authHeader.key }),
    };
  }
  const axiosInstance = getAxiosInstance({ headers });

  switch (method) {
    case EWebhookMethod.GET:
      return ({
        url,
        config,
      }: {
        url: string;
        config?: AxiosRequestConfig;
      }): Promise<AxiosResponse> => axiosInstance.get(url, config);

    case EWebhookMethod.POST:
      return <T>({
        url,
        data,
        config,
      }: {
        url: string;
        data?: T;
        config?: AxiosRequestConfig;
      }): Promise<AxiosResponse> => axiosInstance.post(url, prepareData(bodyType, data), config);

    case EWebhookMethod.PUT:
      return <T>({
        url,
        data,
        config,
      }: {
        url: string;
        data?: T;
        config?: AxiosRequestConfig;
      }): Promise<AxiosResponse> => axiosInstance.put(url, prepareData(bodyType, data), config);

    case EWebhookMethod.DELETE:
      return <T>({
        url,
        data,
        config,
      }: {
        url: string;
        data?: T;
        config?: AxiosRequestConfig;
      }): Promise<AxiosResponse> =>
        axiosInstance.delete(url, { ...config, data: prepareData(bodyType, data) });

    default:
      throw new Exception(
        EResponseStatus.NotFound,
        EErrorCode.WEBHOOK_HISTORY_METHOD_NOT_SUPPORTED
      );
  }
};

const getAxiosInstance = ({
  headers = {},
  bodyType,
}: {
  headers?: Object;
  bodyType?: EWebhookBodyType;
}) => {
  const baseHeaders: Record<string, string> = {};

  if (bodyType === EWebhookBodyType.JSON || !bodyType) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  const axiosInstance = axios.create({
    timeout: 10000,
    headers: baseHeaders,
  });

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.status > 299 || response.status < 200) {
        let detail = response.data;

        if (typeof response.data !== 'object') {
          detail = {
            error: 'Unknown Error!',
            raw: response.data,
          };
        }

        logger.error({
          type: 'Axios',
          layer: 'Response',
          state: 'OnFulfilled',
          detail: serialize(detail),
          path: response.config.url,
        });

        throw new Exception(response.status, EErrorCode.API_CALL_ERROR);
      }

      return response.data;
    },
    async (error: AxiosError) => {
      const { status = EResponseStatus.InternalServerError, data } = error.response || {};
      let detail = error.response?.data;

      if (!error.response || typeof error.response.data !== 'object') {
        detail = {
          error: 'Unknown Error!',
          raw: error.response?.data,
        };
      }

      logger.error({
        type: 'Axios',
        layer: 'Response',
        state: 'OnFulfilled',
        detail: serialize(detail),
        path: error.response?.config.url || 'Unknown URL!',
      });

      throw new Exception(status, EErrorCode.API_CALL_ERROR);
    }
  );

  axiosInstance.interceptors.request.use(
    (config) => {
      Object.assign(config.headers, headers);

      return config;
    },
    (e) =>
      Promise.reject(
        new Exception(
          EResponseStatus.BadRequest,
          new Error((e as Error).message) || EErrorCode.API_CALL_ERROR
        )
      )
  );

  return axiosInstance;
};

const prepareData = <T>(bodyType: EWebhookBodyType | null, data?: T): any => {
  if (!data || !bodyType) return {};

  switch (bodyType) {
    case EWebhookBodyType.FORM_DATA: {
      const formData = new FormData();
      Object.entries(data as Record<string, any>).forEach(([key, value]) => {
        formData.append(key, value);
      });
      return formData;
    }

    case EWebhookBodyType.JSON:
      return data;
    default:
      throw new Exception(
        EResponseStatus.NotFound,
        EErrorCode.WEBHOOK_HISTORY_BODY_TYPE_NOT_SUPPORTED
      );
  }
};
