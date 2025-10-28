import chalk from 'chalk';

export const formatString = (format: string[], data: Record<any, any>, joinBy: string = '') => {
  return format.map((f) => data[f] || '').join(joinBy);
};

export const splitString = (str: string, splitBy = '') => {
  return str.split(splitBy);
};

export const bindStringFormat = (format: string, data: Object) => {
  let result = format;

  for (const [key, value] of Object.entries(data)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    result = result.replace(new RegExp(`{${escapedKey}}`, 'g'), String(value));
  }

  return result;
};

export const boundString = (str: string, boundChars: string[] = []) => {
  return str
    .padEnd(str.length + 1, boundChars[1] || '')
    .padStart(str.length + 2, boundChars[0] || ' ');
};

export const textColor = chalk;

export const serialize = (data: unknown, space?: number | string): string => {
  return typeof data === 'string' ? data : JSON.stringify(data, null, space);
};
export const deserialize = (data: string): unknown => {
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};

export const padNumberString = (num: number | string, length?: number) => {
  let extNum = typeof num === 'number' ? num.toString() : num;

  return extNum.padStart(length || extNum.length, '0');
};
