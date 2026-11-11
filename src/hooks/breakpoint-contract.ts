export type BreakpointDefinition = Readonly<Record<string, number>>;
export const breakpointEntries = <const T extends BreakpointDefinition>(
  definition: T
) => {
  const entries = Object.entries(definition) as [keyof T & string, number][];
  if (!entries.length) {
    throw new Error("Breakpoints must declare at least one threshold.");
  }
  let previous = -1;
  for (const [name, threshold] of entries) {
    if (!name || !Number.isFinite(threshold) || threshold < 0) {
      throw new Error(
        `Breakpoint "${name}" must have a finite, non-negative threshold.`
      );
    }
    if (threshold <= previous) {
      throw new Error(
        "Breakpoint thresholds must be strictly ascending in declaration order."
      );
    }
    previous = threshold;
  }
  return entries;
};
export const breakpointAt = <Name extends string>(
  entries: readonly (readonly [Name, number])[],
  width: number
): Name | "base" => {
  let current: Name | "base" = "base";
  for (const [name, threshold] of entries) {
    if (width < threshold) {
      break;
    }
    current = name;
  }
  return current;
};
