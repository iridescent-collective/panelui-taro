import type { BottomSheetProps } from "./types";

const DETENT_FRACTION = { full: 0.9, half: 0.5 };
const SIZE_FRACTION = { full: 0.94, half: 0.5 };
export const bottomSheetDetentHeight = (
  points: BottomSheetProps["snapPoints"],
  height: number
): number | undefined => {
  const first = points?.[0];
  if (first === "half" || first === "full") {
    return height * DETENT_FRACTION[first];
  }
  if (first && typeof first === "object") {
    return "fraction" in first ? height * first.fraction : first.height;
  }
};
export const sheetGeometry = (
  height: number,
  insets: { top: number; bottom: number },
  platform: string,
  detached: boolean,
  size: "auto" | "half" | "full"
) => {
  const detachedGap =
    platform === "android" ? Math.max(insets.bottom + 12, 24) : 24;
  const gap = detached ? detachedGap : 0;
  const cap = Math.max(0, height - insets.top - (detached ? gap : 8));
  return {
    cap,
    gap,
    height:
      size === "auto" ? undefined : Math.min(height * SIZE_FRACTION[size], cap),
    paddingBottom: detached ? 16 : Math.max(insets.bottom, 16),
  };
};
export const projectSheetVelocity = (velocity: number): number =>
  ((velocity / 1000) * 0.998) / (1 - 0.998);
export const shouldDismissSheet = (
  distance: number,
  velocity: number
): boolean => distance + projectSheetVelocity(velocity) > 120 || velocity > 800;
