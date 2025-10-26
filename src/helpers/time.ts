import { ManipulateType } from 'dayjs';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception } from './response';

export const convertToTimeUnit = (timeStr: string): [number, string] => {
  const match = timeStr.match(/^(\d+)([hmds])$/i);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  return [value, unit];
};

export const convertToDayjs = (timeStr: string): [number, ManipulateType] => {
  const [value, unit] = convertToTimeUnit(timeStr);

  switch (unit) {
    case 'h':
      return [value, 'hour'];
    case 'm':
      return [value, 'minute'];
    case 'd':
      return [value, 'day'];
    case 's':
      return [value, 'second'];
    default:
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.TIME_UNIT_INVALID);
  }
};
