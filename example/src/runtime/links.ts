import { setClipboardData } from "@tarojs/taro";

export const Linking = {
  openURL: (url: string) => setClipboardData({ data: url }),
};
