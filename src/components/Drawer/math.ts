import type { DirectionValue } from "../../hooks/use-direction";
import { DRAWER_HEIGHT, DRAWER_WIDTH } from "./constants";
import type { DrawerSide, DrawerSize } from "./types";

export const drawerGeometry = (
  width: number,
  height: number,
  side: DrawerSide,
  size: DrawerSize,
  direction: DirectionValue
) => {
  const horizontal = side === "start" || side === "end";
  const sign = direction === "ltr" ? 1 : -1;
  const extent = horizontal
    ? Math.min(width * DRAWER_WIDTH[size].fraction, DRAWER_WIDTH[size].max)
    : height * DRAWER_HEIGHT[size];
  let physical: "left" | "right" | "top" | "bottom";
  let outward: number;
  if (horizontal) {
    physical = (side === "start") === (direction === "ltr") ? "left" : "right";
    outward = (side === "start" ? -1 : 1) * sign;
  } else {
    physical = side === "top" ? "top" : "bottom";
    outward = side === "top" ? -1 : 1;
  }
  return { extent, horizontal, outward, physical };
};
