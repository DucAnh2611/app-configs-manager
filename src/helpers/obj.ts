export const excludeFields = <T extends Record<string, any>>(
  data: T,
  excludes: string[]
): Partial<T> => {
  const clone: any = structuredClone(data);

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

  for (const path of excludes) deletePath(clone, path);

  return clone;
};
