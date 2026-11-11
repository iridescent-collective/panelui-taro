import {
  PANEL_EDGE_GAP,
  PANEL_MIN_HEIGHT,
  PANEL_MAX_HEIGHT,
} from "./constants";
import type { SearchBarPanelPlacement } from "./types";

export const searchPanelHeight = ({
  height,
  keyboard,
  offset,
  anchor,
  avoiding,
  placement,
  cap,
}: {
  height: number;
  keyboard: number;
  offset: number;
  anchor: { top: number; height: number } | null;
  avoiding: boolean;
  placement: SearchBarPanelPlacement;
  cap?: number;
}) => {
  const fieldHeight = anchor?.height ?? 0;
  const top =
    avoiding && keyboard > 0
      ? height - keyboard - offset - fieldHeight
      : (anchor?.top ?? 0);
  const room =
    placement === "top"
      ? top - PANEL_EDGE_GAP
      : height - keyboard - top - fieldHeight - PANEL_EDGE_GAP;
  return Math.max(Math.min(cap ?? PANEL_MAX_HEIGHT, room), PANEL_MIN_HEIGHT);
};
