export type MapCorner =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export type MapOverlayPosition = "top" | "bottom" | MapCorner;
export interface MapInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export type MapInsetsInput = number | Partial<MapInsets>;
export interface MapReservation {
  position: MapOverlayPosition;
  extent: number;
}
export type MapOffsets = Partial<MapInsets>;
const clean = (value: number | undefined): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
export const toMapInsets = (inset: MapInsetsInput | undefined): MapInsets => {
  if (typeof inset === "number") {
    const value = clean(inset);
    return { bottom: value, left: value, right: value, top: value };
  }
  return {
    bottom: clean(inset?.bottom),
    left: clean(inset?.left),
    right: clean(inset?.right),
    top: clean(inset?.top),
  };
};
export const addMapInsets = (a: MapInsets, b: MapInsets): MapInsets => ({
  bottom: a.bottom + b.bottom,
  left: a.left + b.left,
  right: a.right + b.right,
  top: a.top + b.top,
});
export const cornersOf = (position: MapOverlayPosition): MapCorner[] => {
  if (position === "top") {
    return ["top-left", "top-right"];
  }
  if (position === "bottom") {
    return ["bottom-left", "bottom-right"];
  }
  return [position];
};
export const reservedAt = (
  corner: MapCorner,
  reservations: Iterable<MapReservation>
): number => {
  let reserved = 0;
  for (const { position, extent } of reservations) {
    if (extent > reserved && cornersOf(position).includes(corner)) {
      reserved = extent;
    }
  }
  return reserved;
};
export const overlayOffsets = (
  position: MapOverlayPosition,
  inset: MapInsets
): MapOffsets => {
  const vertical = position.startsWith("top")
    ? { top: inset.top }
    : { bottom: inset.bottom };
  if (position === "top" || position === "bottom") {
    return { ...vertical, left: inset.left, right: inset.right };
  }
  return position.endsWith("left")
    ? { ...vertical, left: inset.left }
    : { ...vertical, right: inset.right };
};
export const overlayReservation = (
  position: MapOverlayPosition,
  inset: MapInsets,
  height: number
): MapReservation | null => {
  if (clean(height) === 0) {
    return null;
  }
  const edge = position.startsWith("top") ? inset.top : inset.bottom;
  return { extent: edge + height, position };
};
export const resolveMapInsets = (
  inset: MapInsetsInput | undefined,
  gap: number,
  safeArea: MapInsets
): MapInsets => {
  const own =
    typeof inset === "number"
      ? toMapInsets(inset)
      : toMapInsets({
          bottom: inset?.bottom ?? gap,
          left: inset?.left ?? gap,
          right: inset?.right ?? gap,
          top: inset?.top ?? gap,
        });
  return addMapInsets(own, toMapInsets(safeArea));
};
export const controlsOffsets = (
  corner: MapCorner,
  {
    gap,
    inset,
    reserved,
  }: {
    gap: number;
    inset: MapInsets;
    reserved: number;
  }
): MapOffsets => {
  const top = corner.startsWith("top");
  const left = corner.endsWith("left");
  const past = clean(reserved) > 0 ? clean(reserved) + gap : 0;
  const vertical = Math.max(top ? inset.top : inset.bottom, past);
  const horizontal = left ? inset.left : inset.right;
  return {
    ...(top ? { top: vertical } : { bottom: vertical }),
    ...(left ? { left: horizontal } : { right: horizontal }),
  };
};
