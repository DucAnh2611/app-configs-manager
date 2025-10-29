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

export const resetTextStyle = (str: string) => {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
};

export const serialize = (data: unknown, space?: number | string): string => {
  const stringReturns: Array<string> = ['number', 'bigint', 'boolean', 'string', 'undefined'];
  if (stringReturns.includes(typeof data)) return String(data);

  return JSON.stringify(
    data,
    (_, value) => {
      if (value instanceof Map) return { __type: 'Map', value: Array.from(value.entries()) };
      if (value instanceof Set) return { __type: 'Set', value: Array.from(value) };
      if (value instanceof Date) return { __type: 'Date', value: value.toISOString() };
      if (value instanceof RegExp) return { __type: 'RegExp', value: value.toString() };
      return value;
    },
    space
  );
};

const tryParseJSON = (str: string): unknown => {
  try {
    const parsed = JSON.parse(str);

    if (typeof parsed === 'string') return tryParseJSON(parsed);

    if (parsed && typeof parsed === 'object') {
      for (const key in parsed) {
        if (typeof parsed[key] === 'string') {
          parsed[key] = tryParseJSON(parsed[key]);
        }
      }
    }

    return parsed;
  } catch {
    return str;
  }
};

export const deserialize = (data: string): unknown => {
  const result = tryParseJSON(data);

  const reviveSpecial = (value: any): any => {
    if (value && typeof value === 'object' && '__type' in value) {
      switch (value.__type) {
        case 'Map':
          return new Map(value.value.map(([k, v]: any) => [k, reviveSpecial(v)]));
        case 'Set':
          return new Set(value.value.map(reviveSpecial));
        case 'Date':
          return new Date(value.value);
        case 'RegExp': {
          const match = value.value.match(/^\/(.*)\/([a-z]*)$/);
          return match ? new RegExp(match[1], match[2]) : value.value;
        }
      }
    }

    if (Array.isArray(value)) return value.map(reviveSpecial);

    if (value && typeof value === 'object') {
      for (const k in value) value[k] = reviveSpecial(value[k]);
    }
    return value;
  };

  return reviveSpecial(result);
};

export const padNumberString = (num: number | string, length?: number) => {
  let extNum = typeof num === 'number' ? num.toString() : num;

  return extNum.padStart(length || extNum.length, '0');
};
