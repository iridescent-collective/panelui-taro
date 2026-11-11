import { progressIndicatorWidth } from "./utils";

export const progressMotion = (
  fraction: number,
  indeterminate: boolean,
  reducedMotion: boolean,
  direction: "ltr" | "rtl"
) => {
  let className = reducedMotion ? "" : "panelui-progress-transition";
  if (indeterminate) {
    className = reducedMotion ? "panelui-pulse" : "panelui-progress-sweep";
    if (!reducedMotion && direction === "rtl") {
      className += " panelui-progress-sweep--rtl";
    }
  }
  return {
    className,
    style: {
      float:
        indeterminate || direction === "ltr"
          ? ("left" as const)
          : ("right" as const),
      width: progressIndicatorWidth(fraction, indeterminate, reducedMotion),
    },
  };
};
