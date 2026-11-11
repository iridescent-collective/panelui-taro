import { navigateTo } from "@tarojs/taro";

export const openPage = (url: string) => navigateTo({ url });
