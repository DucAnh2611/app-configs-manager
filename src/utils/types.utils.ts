import dayjs, { Dayjs, ManipulateType } from 'dayjs';
import { APP_CONSTANTS } from '../constants';
import { Validator } from './validator.util';

export const when = (variable: unknown) => ({
  and: (con2: unknown) => toBoolean(variable) && toBoolean(con2),
  or: (con2: unknown) => toBoolean(variable) || toBoolean(con2),
  value: () => toBoolean(variable),
});

export const is = when;
export const check = when;
export const satisfy = when;

export const and = (...conds: boolean[]) => {
  return conds.every((cond) => !!cond);
};

export const or = (...conds: boolean[]) => {
  return conds.some((cond) => !!cond);
};

export const toBoolean = (data: unknown) => {
  switch (typeof data) {
    case 'string':
      return !!data.trim();

    case 'number':
    case 'bigint':
      return data !== 0;

    case 'boolean':
      return data;

    case 'symbol':
    case 'function':
      return true;

    case 'undefined':
      return false;

    case 'object':
      if (data === null) return false;

      if (Array.isArray(data)) {
        return !!data.length;
      }

      return Object.keys(data).length > 0; // Fix: was Object(data).keys()
  }
};

export const isNullOrUndefined = (value?: unknown | null) => {
  return processConditions(value).or(
    (v) => v === null,
    (v) => typeof v === 'undefined'
  );
};

export const isNullAndConditions = <T>(
  value: T | null,
  ...conditions: Array<(value: T) => boolean>
): boolean => {
  if (value === null) return true;

  return conditions.every((condition) => condition(value));
};

export const processConditions = <T>(data: T) => ({
  and: (...conditions: Array<(data: T) => boolean>) =>
    conditions.reduce((previous, condition) => previous && condition(data), true),
  or: (...conditions: Array<(data: T) => boolean>) =>
    conditions.reduce((previous, condition) => previous || condition(data), false),
});

export const isManipulateType = (value: unknown): value is ManipulateType => {
  return when(typeof value === 'string').and(
    (APP_CONSTANTS.DAYJS_MANIPULATE_UNITS as readonly string[]).includes(value as string)
  );
};

type TTransformTypes<T> = {
  'date-unit': ManipulateType;
  string: string;
  number: number;
  boolean: boolean;
  date: Dayjs;
  custom: T;
};

export interface ITransformTypes<CustomType extends unknown = unknown> {
  dateUnit(): TTransformTypes<CustomType>['date-unit'];
  string(): TTransformTypes<CustomType>['string'];
  number(): TTransformTypes<CustomType>['number'];
  boolean(): TTransformTypes<CustomType>['boolean'];
  date(): TTransformTypes<CustomType>['date'];
  custom(customTypeTranform: (value: unknown) => CustomType): CustomType;
}

type TCustomParamsValue = unknown;

export const transformTypes = <CustomType extends unknown = unknown>(value: unknown) =>
  new (class implements ITransformTypes<CustomType> {
    private v: Validator;

    constructor() {
      this.v = new Validator(value);
    }

    dateUnit() {
      const validate = this.v.string().execute();

      if (when(!isManipulateType(value)).or(!validate.success))
        throw new Error(`Cannot convert "${value}" to date-unit sytem`);

      return String(value) as TTransformTypes<CustomType>['date-unit'];
    }

    string() {
      const validate = this.v.string().execute();
      if (!validate.success) throw new Error(`Cannot convert "${value}" to string`);

      return String(value) as TTransformTypes<CustomType>['string'];
    }

    number() {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Cannot convert "${value}" to number`);
      }

      return num as TTransformTypes<CustomType>['number'];
    }

    boolean() {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (check(lowerValue === 'false').or(lowerValue === '0'))
          return false as TTransformTypes<CustomType>['boolean'];
      }

      return Boolean(value) as TTransformTypes<CustomType>['boolean'];
    }

    date() {
      if (check(value !== undefined).and(value !== null)) {
        const parsedDate = dayjs(value as any);
        if (!parsedDate.isValid()) {
          throw new Error(`Cannot parse "${value}" as date`);
        }

        return parsedDate as TTransformTypes<CustomType>['date'];
      }

      return dayjs() as TTransformTypes<CustomType>['date'];
    }

    custom(customTypeTranform: (value: TCustomParamsValue) => CustomType) {
      return customTypeTranform(value) as TTransformTypes<CustomType>['custom'];
    }
  })();
