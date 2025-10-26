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
