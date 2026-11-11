import { getAppBaseInfo } from "@tarojs/taro";
import { createContext, useContext } from "react";

export type DirectionValue = "ltr" | "rtl";
export const DirectionContext = createContext<DirectionValue | null>(null);
export const deviceDirection = (): DirectionValue => {
  try {
    return /^(?:ar|fa|he|ur)(?:-|_|$)/u.test(getAppBaseInfo().language ?? "")
      ? "rtl"
      : "ltr";
  } catch {
    return "ltr";
  }
};
export const useDirection = (): DirectionValue =>
  useContext(DirectionContext) ?? deviceDirection();
export const useDirectionSign = (): 1 | -1 =>
  useDirection() === "rtl" ? -1 : 1;
