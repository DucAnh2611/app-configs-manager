import dayjs, { Dayjs, ManipulateType } from 'dayjs';
import { APP_CONSTANTS } from '../constants';

export const isNullOrUndefined = (value?: unknown | null) => {
  return processConditions(value).or(
    (v) => v === null,
    (v) => typeof v === 'undefined'
  );
};

export const isNullAndCondtions = <T extends unknown = unknown>(
  value: T | null,
  ...conditions: Array<(value: T) => boolean>
): boolean => {
  if (value === null) return true;

  return processConditions(value).and(...conditions);
};

export const processConditions = <T>(data: T) => ({
  and: (...conditions: Array<(data: T) => boolean>) =>
    conditions.reduce((previous, condition) => previous && condition(data), false),
  or: (...conditions: Array<(data: T) => boolean>) =>
    conditions.reduce((previous, condition) => previous || condition(data), false),
});

export const isManipulateType = (value: unknown): value is ManipulateType => {
  return (
    typeof value === 'string' &&
    (APP_CONSTANTS.DAYJS_MANIPULATE_UNITS as readonly string[]).includes(value)
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
    dateUnit() {
      if (!isManipulateType(value)) return 'ms' as TTransformTypes<CustomType>['date-unit'];
      return String(value) as TTransformTypes<CustomType>['date-unit'];
    }
    string() {
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
        if (lowerValue === 'false' || lowerValue === '0')
          return false as TTransformTypes<CustomType>['boolean'];
      }

      return Boolean(value) as TTransformTypes<CustomType>['boolean'];
    }

    date() {
      if (value !== undefined && value !== null) {
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
