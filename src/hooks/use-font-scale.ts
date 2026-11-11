import { getSystemInfoSync } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { subscribeWindowResize } from "./window-resize-subscription";

export const readFontScale = () => {
  const size = getSystemInfoSync().fontSizeSetting;
  return typeof size === "number" && Number.isFinite(size) && size > 0
    ? size / 16
    : 1;
};
export const useFontScale = () => {
  const [scale, setScale] = useState(readFontScale);
  useEffect(() => subscribeWindowResize(() => setScale(readFontScale())), []);
  return scale;
};
