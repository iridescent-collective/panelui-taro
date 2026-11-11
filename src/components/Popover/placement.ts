import { placeAnchoredPanel } from "../../lib/anchored-position";
import type {
  PopoverAlign,
  PopoverAnchorRect,
  PopoverPlacement,
} from "./types";

export const POPOVER_ARROW_SIZE = 12;
export const POPOVER_SCREEN_MARGIN = 12;
export const POPOVER_OFFSET = 8;
export interface PlaceArgs {
  trigger: PopoverAnchorRect;
  size: { width: number; height: number };
  placement: PopoverPlacement;
  align: PopoverAlign;
  offset: number;
  alignOffset: number;
  bounds: { left: number; right: number; top: number; bottom: number };
}
export const placePopover = (args: PlaceArgs) =>
  placeAnchoredPanel({ ...args, arrowSize: POPOVER_ARROW_SIZE });
export const POPOVER_ENTRY_SHIFT: Record<
  PopoverPlacement,
  { x: number; y: number }
> = {
  bottom: { x: 0, y: -8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
  top: { x: 0, y: 8 },
};
