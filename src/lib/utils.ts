import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { decodeWxssClassName } from "./classname-encoding";

const isBusinessShadow = (value: string): boolean =>
  /^\[var\(--shadow-[^)]+\)\]$/u.test(value);

const merge = extendTailwindMerge({
  experimentalParseClassName: ({ className, parseClassName }) =>
    parseClassName(decodeWxssClassName(className)),
  extend: {
    classGroups: {
      shadow: [{ shadow: [isBusinessShadow] }],
    },
  },
});

export const cn = (...inputs: ClassValue[]): string => merge(clsx(inputs));
