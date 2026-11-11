import { getWindowInfo } from "@tarojs/taro";

import { imageSourceUri } from "../../lib/image-source";
import { AVATAR_SIZE_POINTS } from "./avatar-group";
import type { AvatarSizeName } from "./avatar-group";
import type { AvatarImageSource } from "./types";

export const avatarImageUri = (
  source: AvatarImageSource | undefined,
  size: AvatarSizeName
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
  const window = getWindowInfo();
  const desired =
    ((AVATAR_SIZE_POINTS[size] * window.windowWidth) / 375) * window.pixelRatio;
  return imageSourceUri(source, desired);
};
