import {
  getCurrentPages,
  navigateBack,
  navigateTo,
  redirectTo,
} from "@tarojs/taro";

import components from "../data/components.json";

const destination = (url: string) => {
  if (url.includes("voice")) {
    return `${components.find((item) => item.slug === "ai-input")?.route ?? "/pages/index/index"}?demo=voice`;
  }
  if (url.includes("sketch")) {
    return (
      components.find((item) => item.slug === "sketch")?.route ??
      "/pages/index/index"
    );
  }
  return url;
};
export const router = {
  back: () =>
    getCurrentPages().length > 1
      ? navigateBack()
      : redirectTo({ url: "/pages/index/index" }),
  push: (url: string) => navigateTo({ url: destination(url) }),
};
export const useRouter = () => router;
