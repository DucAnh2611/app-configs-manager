export const excludeFields = <T extends Record<string, any> = {}>(
  data: T,
  excludes: Array<keyof T>
): Partial<T> => {
  const clone: T = structuredClone(data);

  const deletePath = (obj: any, path: string) => {
    if (!obj) return;

    const parts = path
      .replace(/\[(\d+|\*)\]/g, '.$1')
      .split('.')
      .filter(Boolean);

    const removeRecursively = (target: any, idx: number) => {
      if (target == null) return;

      const key = parts[idx];

      if (idx === parts.length - 1) {
        if (key === '*') {
          if (Array.isArray(target)) {
            for (const item of target) {
              for (const k of Object.keys(item)) {
                delete item[k];
              }
            }
          }
        } else if (Array.isArray(target)) {
          for (const item of target) {
            delete item[key];
          }
        } else {
          delete target[key];
        }
        return;
      }

      if (key === '*') {
        if (Array.isArray(target)) {
          for (const item of target) removeRecursively(item, idx + 1);
        }
      } else {
        removeRecursively(target[key], idx + 1);
      }
    };

    removeRecursively(obj, 0);
  };

  for (const path of excludes) deletePath(clone, String(path));

  return clone;
};

type TOptionsDeepCompare = {
  sensitiveKey: boolean;
};

const defaultOptions: TOptionsDeepCompare = {
  sensitiveKey: false,
};

export const deepCompare = (
  obj1: any,
  obj2: any,
  options: Partial<TOptionsDeepCompare> = defaultOptions
) => {
  const opts = { ...defaultOptions, ...options };
  const { sensitiveKey } = opts;

  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) || Array.isArray(obj2)) {
    if (!Array.isArray(obj1) || !Array.isArray(obj2)) return false;
    if (obj1.length !== obj2.length) return false;

    for (let i = 0; i < obj1.length; i++) {
      if (!deepCompare(obj1[i], obj2[i], opts)) return false;
    }
    return true;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  const normalize = (key: string) => (sensitiveKey ? key.toLowerCase() : key);

  const map1 = new Map(keys1.map((k) => [normalize(k), k]));
  const map2 = new Map(keys2.map((k) => [normalize(k), k]));

  if (map1.size !== map2.size) return false;

  for (const key of map1.keys()) {
    if (!map2.has(key)) return false;

    const realKey1 = map1.get(key)!;
    const realKey2 = map2.get(key)!;

    if (!deepCompare(obj1[realKey1], obj2[realKey2], opts)) return false;
  }

  return true;
};

export const attachField = (
  baseObj: Record<string, unknown>,
  ...attaches: Array<{ when: boolean; [x: string]: unknown }>
) => {
  const res = { ...baseObj };

  for (const attach of attaches) {
    const { when, ...attachData } = attach;
    if (!when) continue;

    Object.assign(res, attachData);
  }

  return res;
};

type TAttachHandler = (...args: any[]) => unknown | Promise<unknown>;
type TAttachConfig = Record<string, TAttachHandler>;

type TAttachedMethods<TAttach extends TAttachConfig> = {
  [K in keyof TAttach]: (...args: Parameters<TAttach[K]>) => ReturnType<TAttach[K]>;
};

/**
 *
 * @param attach methods need to be attach
 * @param data default is {}
 * @returns object have attribute of data and attached methods
 */
export const attachMethods = <TData extends Record<string, unknown>, TAttach extends TAttachConfig>(
  data: TData,
  attach: (context: { data: Readonly<TData> }) => TAttach
) => {
  const attachObject = attach({ data });

  const attachedMethods = Object.entries(attachObject).reduce((acc, [key, handler]) => {
    acc[key as keyof TAttach] = (...args: Parameters<typeof handler>) => {
      return handler(...args) as any;
    };
    return acc;
  }, {} as TAttachedMethods<TAttach>);

  return { ...data, ...attachedMethods } as TData & TAttachedMethods<TAttach>;
};
