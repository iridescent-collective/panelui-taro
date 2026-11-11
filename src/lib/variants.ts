import { tv as createVariants } from "../vendor/tailwind-variants/lite";

import { cn } from "./utils";

type Resolver = (...args: unknown[]) => unknown;

function mergeOutput(value: unknown): unknown {
  if (typeof value === "string") {
    return cn(value);
  }
  if (value === null || typeof value !== "object") {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value).map(([name, slot]) => [
      name,
      typeof slot === "function" ? mergeResolver(slot as Resolver) : slot,
    ])
  );
}

function mergeResolver(resolver: Resolver): Resolver {
  return Object.assign(
    (...args: unknown[]) => mergeOutput(resolver(...args)),
    resolver
  );
}

const createMergedVariants = (...args: Parameters<typeof createVariants>) =>
  mergeResolver(createVariants(...args) as Resolver);

export const tv = createMergedVariants as typeof createVariants;
