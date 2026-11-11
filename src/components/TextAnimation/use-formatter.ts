import { useMemo } from "react";

export const useFormatter = (
  decimals: number,
  formatOptions?: Intl.NumberFormatOptions
) =>
  useMemo(() => {
    if (formatOptions) {
      try {
        const format = new Intl.NumberFormat(undefined, formatOptions);
        return (value: number) => format.format(value);
      } catch {
        return (value: number) => value.toFixed(decimals);
      }
    }
    return (value: number) => value.toFixed(decimals);
  }, [decimals, formatOptions]);
