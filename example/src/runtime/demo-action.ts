import { showToast } from "@tarojs/taro";

// These examples have no business service behind their visual action controls.
export const demoAction = (label: string) => () => {
  void showToast({ title: `${label} · demo`, icon: "none" });
};
