import { isEnum } from 'class-validator';
import { REQUEST_CONSTANTS } from '../constants';
import { EErrorCode, EResponseStatus, ESort } from '../enums';
import { splitString } from './format-string';
import { Exception } from './response';

export const getSortObject = <T>(sortStr: string): Record<keyof Partial<T>, ESort> => {
  const fieldsSplited = splitString(sortStr, REQUEST_CONSTANTS.SORT_FIELD_SPLIT);

  const res = {} as Record<keyof Partial<T>, ESort>;

  fieldsSplited.forEach((field) => {
    const [f, order] = splitString(field, REQUEST_CONSTANTS.SORT_OPERATOR);

    if (!isEnum(order, ESort)) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.SORT_ORDER_NOT_SUPPORTED);
    }

    res[f as keyof T] = order as ESort;
  });

  return res;
};
