import { vibrateShort } from "@tarojs/taro";

export const selectionTick = async (): Promise<boolean> => {
  try {
    await vibrateShort({ type: "light" });
    return true;
  } catch {
    return false;
  }
};
export const impactKnock = async (): Promise<boolean> => {
  try {
    await vibrateShort({ type: "medium" });
    return true;
  } catch {
    return false;
  }
};
