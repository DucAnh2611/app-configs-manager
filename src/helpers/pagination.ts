import { isEnum } from 'class-validator';
import { REQUEST_CONSTANTS } from '../constants';
import { ESort } from '../enums';
import { splitString } from './format-string';

export const getSortObject = <T>(sortStr: string): Record<keyof Partial<T>, ESort> => {
  const fieldsSplited = splitString(sortStr, REQUEST_CONSTANTS.SORT_FIELD_SPLIT);

  const res = {} as Record<keyof Partial<T>, ESort>;

  fieldsSplited.forEach((field) => {
    const [f, order] = splitString(field, REQUEST_CONSTANTS.SORT_OPERATOR);

    if (!isEnum(order?.trim(), ESort) && !isEnum(Number(order), ESort)) {
      return;
    }

    res[f.trim() as keyof T] = (Number(order) || order.trim()) as ESort;
  });

  return res;
};
