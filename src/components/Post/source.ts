import type { AvatarImageSource } from "../Avatar/types";

export const imageUri = (source: AvatarImageSource): string => {
  if (typeof source === "string") {
    return source;
  }
  if (Array.isArray(source)) {
    return source[0]?.uri ?? "";
  }
  return (source as { uri: string }).uri;
};
