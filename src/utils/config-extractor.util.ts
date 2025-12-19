import { EErrorCode, EResponseStatus } from '../enums';
import { Exception } from '../helpers';
import { TConfigBaseRecordData, TConfigRecords } from '../types';
import { isNullAndConditions, ITransformTypes, transformTypes, when } from './types.utils';

export class ConfigExtractor {
  constructor(private configs: TConfigRecords = {}) {}

  add(configs: TConfigRecords) {
    this.configs = { ...this.configs, ...configs };
    return this;
  }

  get<T = unknown>(property: string, transform?: TTransformConfigParams): T | null {
    const value = this.configs[property];
    let finalValue: TConfigBaseRecordData | null = value;

    if (!this.configs.prototype.hasOwnProperty(property)) {
      finalValue = null;
    }

    if (transform) return this.transform<T>(finalValue, transform);

    return finalValue as T | null;
  }

  select<
    M extends Partial<{
      [K in keyof TConfigRecords]: TTransformConfigParams;
    }>,
  >(properties: M) {
    const executeGet = <T extends Object = {}>(properties: M, data: T) => ({
      throwOn: (...throwConditions: Array<(data: T & { key: keyof M }) => boolean>) =>
        (Object.keys(properties) as (keyof M)[]).reduce((result, key) => {
          const propertyValue = this.get(key as string, properties[key]);

          if (
            when(propertyValue == null).and(
              isNullAndConditions({ ...data, key }, ...throwConditions)
            )
          ) {
            throw new Exception(
              EResponseStatus.NotImplemented,
              EErrorCode.CONFIG_PROPERTY_INVALID,
              key
            );
          }

          result[key] = propertyValue;
          return result;
        }, {} as any),
    });

    return {
      throwOnNull: <B extends Array<keyof M>>(keys: B): TSelectResultThrowNull<M, B> =>
        executeGet(properties, { throws: new Set(keys) }).throwOn(({ throws, key }) =>
          throws.has(key)
        ),
      allowNull: <B extends Array<keyof M>>(keys: B): TSelectResultAllowNull<M, B> =>
        executeGet(properties, { bypass: new Set(keys) }).throwOn(
          ({ bypass, key }) => !bypass.has(key)
        ),
    };
  }

  private transform<T = unknown>(value: unknown, transform: TTransformConfigParams): T | null {
    if (typeof transform === 'string') {
      // Utils transform
      return transformTypes(value)[
        transform as keyof Omit<ITransformTypes, TGenericTransformMethods>
      ]() as T | null;
    }

    if (!Array.isArray(transform)) return null;
    const [method, ...params] = transform;

    // Utils transform
    const transformFn = transformTypes(value)[method];

    if (params.length === 0) {
      return (transformFn as () => T)() as T | null;
    }

    return transformFn(...params) as T | null;
  }
}

type TGenericTransformMethods = 'custom';

export type TTransformConfigParams =
  | keyof Omit<ITransformTypes, TGenericTransformMethods>
  | {
      [TF in keyof ITransformTypes]: [transform: TF, ...params: Parameters<ITransformTypes[TF]>];
    }[keyof ITransformTypes];

type TResultType<T extends TTransformConfigParams> = T extends keyof Omit<
  ITransformTypes,
  TGenericTransformMethods
>
  ? ITransformTypes[T] extends (...args: any) => infer R
    ? R
    : unknown
  : T extends readonly [infer Method extends keyof ITransformTypes, ...infer Params]
    ? Method extends TGenericTransformMethods
      ? Params extends [(value: unknown) => infer R, ...any[]]
        ? R
        : unknown
      : ReturnType<ITransformTypes[Method]>
    : unknown;

type TSelectProperty<M, K extends keyof M> = M[K] extends TTransformConfigParams
  ? TResultType<M[K]>
  : unknown;

export type TSelectResult<M> = {
  [K in keyof M]: TSelectProperty<M, K>;
};

export type TSelectResultThrowNull<M, B extends Array<keyof M>> = {
  [K in keyof M]: K extends B[number] ? TSelectProperty<M, K> : TSelectProperty<M, K> | null;
};

export type TSelectResultAllowNull<M, B extends Array<keyof M>> = {
  [K in keyof M]: K extends B[number] ? TSelectProperty<M, K> | null : TSelectProperty<M, K>;
};

export const ConfigExtractorTransform = {
  custom<T>(...transform: TParametersTransformTypesCustom<T>): TCustomTransform<T> {
    return ['custom', ...transform];
  },

  enum<E extends Record<string, string | number>>(
    enumObject: E,
    fallback?: E[keyof E]
  ): TCustomTransform<E[keyof E]> {
    const validValues = Object.values(enumObject);

    return ConfigExtractorTransform.custom((value: any): E[keyof E] => {
      if (validValues.includes(value)) return value as E[keyof E];

      const match = validValues.find(
        (v) => String(v).toLowerCase() === String(value).toLowerCase()
      );

      if (match !== undefined) return match as E[keyof E];
      if (fallback !== undefined) return fallback;

      throw new Error(`Invalid enum value: "${value}"`);
    });
  },
};

type TParametersTransformTypesCustom<T> = Parameters<ITransformTypes<T>['custom']>;
type TCustomTransform<T> = ['custom', ...transform: TParametersTransformTypesCustom<T>];
