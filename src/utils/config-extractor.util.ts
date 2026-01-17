import { EErrorCode, EResponseStatus } from '../enums';
import { Exception } from '../helpers';
import { TConfigBaseRecordData, TConfigRecords } from '../types';
import { isNullAndConditions, ITransformTypes, satisfy, transformTypes, when } from './types.utils';

export class ConfigExtractor {
  constructor(private configs: TConfigRecords = {}) {}

  add(configs: TConfigRecords) {
    this.configs = { ...this.configs, ...configs };
    return this;
  }

  static from(configs: TConfigRecords) {
    const instance = new ConfigExtractor(configs);
    return instance;
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
            when(propertyValue == null)
              .and(isNullAndConditions({ ...data, key }, ...throwConditions))
              .truthy()
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

  private get<T = unknown>(property: string, transform?: TTransformConfigParams): T | null {
    const value = this.configs[property] ?? null;
    let finalValue: TConfigBaseRecordData | null = value;

    if (!(property in this.configs) && !transform) {
      finalValue = null;
    }

    if (transform) return this.transform<T>(finalValue, transform);

    return finalValue as T | null;
  }

  private transform<T = unknown>(value: unknown, transform: TTransformConfigParams): T | null {
    if (typeof transform === 'string') {
      // Utils transform
      return transformTypes(value)[
        transform as keyof Omit<ITransformTypes, TGenericTransformMethods>
      ]() as T | null;
    }

    let method: keyof ITransformTypes | null = null;
    let fb: ReturnType<ITransformTypes[keyof ITransformTypes]> | null = null;
    let validTransformPrimitive = false;

    let params: TTransformConfigParams[] = [];
    if (
      when(typeof transform === 'object')
        .and('primitive' in transform)
        .truthy()
    ) {
      const { primitive, fallback } = transform as unknown as TPrimitiveTransform<
        'string' | 'number' | 'boolean' | 'dateUnit' | 'date'
      >;

      method = primitive;
      fb = fallback;
      validTransformPrimitive = true;
      params = [];
    }

    if (satisfy(!Array.isArray(transform)).and(!validTransformPrimitive).truthy()) return null;

    if (Array.isArray(transform)) {
      const transformArray = transform as TTransformConfigParams[];
      method = transformArray[0] as keyof ITransformTypes;

      const [, ...paramsTransformArray] = transformArray;
      params = paramsTransformArray;
    }

    try {
      // Utils transform
      const transformFn = transformTypes(value)[method!];

      return (transformFn as (...args: unknown[]) => unknown)(...params) as T | null;
    } catch (error) {
      if (fb !== undefined) return fb as T | null;

      throw error;
    }
  }
}

type TGenericTransformMethods = 'custom';

export type TTransformConfigParams =
  | keyof Omit<ITransformTypes, TGenericTransformMethods>
  | {
      [TF in keyof ITransformTypes]: [transform: TF, ...params: Parameters<ITransformTypes[TF]>];
    }[keyof ITransformTypes]
  | {
      [TF in keyof Omit<ITransformTypes, TGenericTransformMethods>]: TPrimitiveTransform<TF>;
    }[keyof Omit<ITransformTypes, TGenericTransformMethods>];

type TResultType<T extends TTransformConfigParams> = T extends keyof Omit<
  ITransformTypes,
  TGenericTransformMethods
>
  ? ITransformTypes[T] extends (...args: any) => infer R
    ? R
    : unknown
  : T extends TPrimitiveTransform<keyof Omit<ITransformTypes, TGenericTransformMethods>>
    ? ReturnType<ITransformTypes[T['primitive']]>
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

export type TSelectResultThrowNull<M, B extends Array<keyof M>> = Readonly<{
  [K in keyof M]: K extends B[number] ? TSelectProperty<M, K> : TSelectProperty<M, K> | null;
}>;

export type TSelectResultAllowNull<M, B extends Array<keyof M>> = Readonly<{
  [K in keyof M]: K extends B[number] ? TSelectProperty<M, K> | null : TSelectProperty<M, K>;
}>;

export const CETransform = {
  custom<T>(...transform: TParametersTransformTypesCustom<T>): TCustomTransform<T> {
    return ['custom', ...transform];
  },

  primitives<T extends keyof Omit<ITransformTypes, TGenericTransformMethods>>(
    type: T,
    fallback: ReturnType<ITransformTypes[T]>
  ): TPrimitiveTransform<T> {
    return { primitive: type, fallback };
  },

  enum<E extends Record<string, string | number>>(
    enumObject: E,
    fallback?: E[keyof E]
  ): TCustomTransform<E[keyof E]> {
    const validValues = Object.values(enumObject);

    return CETransform.custom((value: unknown): E[keyof E] => {
      if (typeof value !== 'string') {
        if (fallback !== undefined) return fallback;
        throw new Error(`Invalid enum value: "${value}"`);
      }

      if (validValues.includes(value as string)) return value as E[keyof E];

      const match = validValues.find(
        (v) => String(v).toLowerCase() === String(value).toLowerCase()
      );

      if (match !== undefined) return match as E[keyof E];
      if (fallback !== undefined) return fallback;

      throw new Error(`Invalid enum value: "${value}"`);
    });
  },

  stringTypes<T>(types: Array<Partial<T> | T>, fallback?: T): TCustomTransform<T> {
    return CETransform.custom((value: unknown): T => {
      if (typeof value !== 'string') {
        if (fallback !== undefined) return fallback;
        throw new Error(`Invalid enum value: "${value}"`);
      }

      if (types.includes(value as T)) return value as T;
      if (fallback !== undefined) return fallback;

      throw new Error(`Invalid types value: "${value}"`);
    });
  },

  schema<T extends Record<string, TTransformConfigParams>>(
    configSchema: T,
    fallback?: TSelectResultThrowNull<T, Array<keyof T>> | TSelectResultAllowNull<T, Array<keyof T>>
  ) {
    return {
      allowNull: <B extends Array<keyof T>>(keys: B) =>
        CETransform.custom<TSelectResultAllowNull<T, B>>((value: unknown) => {
          if (typeof value !== 'object') {
            if (fallback !== undefined) return fallback as TSelectResultAllowNull<T, B>;
            throw new Error(`Invalid object value: "${value}"`);
          }
          try {
            return ConfigExtractor.from(value as TConfigRecords)
              .select<T>(configSchema)
              .allowNull(keys);
          } catch (error) {
            if (fallback !== undefined) return fallback as TSelectResultAllowNull<T, B>;
            throw error;
          }
        }),
      throwOnNull: <B extends Array<keyof T>>(keys: B) =>
        CETransform.custom<TSelectResultThrowNull<T, B>>((value: unknown) => {
          if (typeof value !== 'object') {
            if (fallback !== undefined) return fallback as TSelectResultThrowNull<T, B>;
            throw new Error(`Invalid object value: "${value}"`);
          }
          try {
            return ConfigExtractor.from(value as TConfigRecords)
              .select<T>(configSchema)
              .throwOnNull(keys);
          } catch (error) {
            if (fallback !== undefined) return fallback as TSelectResultThrowNull<T, B>;
            throw error;
          }
        }),
    };
  },
};

type TParametersTransformTypesCustom<T> = Parameters<ITransformTypes<T>['custom']>;
type TCustomTransform<T> = ['custom', ...transform: TParametersTransformTypesCustom<T>];
type TPrimitiveTransform<T extends keyof Omit<ITransformTypes, TGenericTransformMethods>> = {
  primitive: T;
  fallback: ReturnType<ITransformTypes[T]>;
};
