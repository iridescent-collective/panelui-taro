import type { PlannerVariant } from "./types";

export const DEFAULT_ENTRY_LIMIT: Record<PlannerVariant, number> = {
  calendar: 3,
  default: 2,
  tiles: 1,
};
export const PALETTE_SIZE = 5;
export const TILE_TINT_OPACITY = 0.32;
export const TILE_ROW_HEIGHT = 64;
export const TILE_ROW_GAP = 4;
export const TILE_GRID_HEIGHT = TILE_ROW_HEIGHT * 6 + TILE_ROW_GAP * 5;
export const DEFAULT_SCROLLER_WEEKS = 53;
export const DEFAULT_WEEK_HEIGHT = 96;
export const VIEWABILITY = { itemVisiblePercentThreshold: 60 };
