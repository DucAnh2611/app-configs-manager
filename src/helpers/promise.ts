export function toPromise<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult | Promise<TResult>,
  ...args: TArgs
): Promise<TResult extends void ? void : TResult> {
  try {
    const result = fn(...args);
    return Promise.resolve(result) as any;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const promiseAll = <T extends readonly unknown[]>(
  ...fns: T
): Promise<{ [K in keyof T]: Awaited<T[K]> }> => {
  return Promise.all(fns) as any;
};
