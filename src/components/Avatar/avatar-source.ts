import { sortCopy } from "../../lib/sort-copy";
import type { AvatarImageSource as ImageSourcePropType } from "./types";

const stableValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableValue).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${sortCopy(
      Object.entries(value).filter(([, entry]) => entry !== undefined),
      ([left], [right]) => left.localeCompare(right)
    )
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableValue(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? String(value);
};

export const avatarSourceIdentity = (
  source: ImageSourcePropType | undefined
) => (source === undefined ? undefined : stableValue(source));
