import type { CSSProperties } from "react";

export const scrollContentStyle = (
  enableFlex: boolean | undefined,
  horizontal: boolean,
  viewport: number
): CSSProperties | undefined => {
  if (!enableFlex) {
    return horizontal ? { minWidth: "100%", width: "max-content" } : undefined;
  }
  return {
    alignContent: "inherit",
    alignItems: "inherit",
    display: "flex",
    flexDirection: "inherit",
    flexGrow: 1,
    flexShrink: 0,
    flexWrap: "inherit",
    gap: "inherit",
    justifyContent: "inherit",
    [horizontal ? "minWidth" : "minHeight"]: `${viewport * 2}rpx`,
    width: horizontal ? "max-content" : "100%",
  };
};
