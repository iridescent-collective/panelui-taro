import type { AvatarImageSource } from "../components/Avatar/types";
import { sortCopy } from "./sort-copy";

export const imageSourceUri = (
  source: AvatarImageSource | undefined,
  pixelWidth: number,
  pixelHeight?: number
): string => {
  if (typeof source === "string") {
    return source;
  }
  if (!source) {
    return "";
  }
  if ("uri" in source) {
    return source.uri;
  }
  const candidates = sortCopy(
    source,
    (left, right) =>
      (left.width ?? 0) * (left.scale ?? 1) -
      (right.width ?? 0) * (right.scale ?? 1)
  );
  const fit = candidates.find((candidate) => {
    const scale = candidate.scale ?? 1;
    return (
      (candidate.width ?? 0) * scale >= pixelWidth &&
      (pixelHeight === undefined ||
        candidate.height === undefined ||
        candidate.height * scale >= pixelHeight)
    );
  });
  return fit?.uri ?? candidates.at(-1)?.uri ?? "";
};
