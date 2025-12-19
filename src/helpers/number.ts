export const randNumber = (
  {
    from = 0,
    to = 1,
    decimal = -1,
  }: {
    from?: number;
    to?: number;
    decimal?: number;
  } = { from: 0, to: 1, decimal: -1 }
) => {
  let res = Math.random();
  const max = Math.max(from ?? 0, to ?? 0);
  const min = Math.max(Math.min(from ?? 0, to ?? 0), 0);

  if (max) res *= max;
  if (min && res < min) res += min;

  return Number(decimal !== -1 ? res.toFixed(decimal) : res);
};
