export type AnchoredPanelPlacement = "top" | "bottom" | "left" | "right";
export type AnchoredPanelAlign = "start" | "center" | "end";
export interface AnchoredPanelArgs {
  trigger: { x: number; y: number; width: number; height: number };
  size: { width: number; height: number };
  placement: AnchoredPanelPlacement;
  align: AnchoredPanelAlign;
  offset: number;
  alignOffset: number;
  bounds: { left: number; right: number; top: number; bottom: number };
  arrowSize?: number;
}
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, Math.max(min, max)));
const aligned = (
  origin: number,
  triggerLength: number,
  length: number,
  align: AnchoredPanelAlign,
  offset: number
): number => {
  if (align === "start") {
    return origin + offset;
  }
  if (align === "end") {
    return origin + triggerLength - length + offset;
  }
  return origin + triggerLength / 2 - length / 2 + offset;
};
export const placeAnchoredPanel = ({
  trigger,
  size,
  placement,
  align,
  offset,
  alignOffset,
  bounds,
  arrowSize = 12,
}: AnchoredPanelArgs) => {
  const room = {
    bottom: bounds.bottom - (trigger.y + trigger.height + offset),
    left: trigger.x - offset - bounds.left,
    right: bounds.right - (trigger.x + trigger.width + offset),
    top: trigger.y - offset - bounds.top,
  };
  const opposite = {
    bottom: "top",
    left: "right",
    right: "left",
    top: "bottom",
  } as const;
  const needed =
    placement === "top" || placement === "bottom" ? size.height : size.width;
  const resolved =
    room[placement] < needed && room[opposite[placement]] > room[placement]
      ? opposite[placement]
      : placement;
  if (resolved === "top" || resolved === "bottom") {
    const top =
      resolved === "bottom"
        ? trigger.y + trigger.height + offset
        : trigger.y - size.height - offset;
    const left = clamp(
      aligned(trigger.x, trigger.width, size.width, align, alignOffset),
      bounds.left,
      bounds.right - size.width
    );
    return {
      arrowOffset: clamp(
        trigger.x + trigger.width / 2 - left,
        arrowSize,
        size.width - arrowSize
      ),
      left,
      placement: resolved,
      top: clamp(top, bounds.top, bounds.bottom - size.height),
    };
  }
  const left =
    resolved === "right"
      ? trigger.x + trigger.width + offset
      : trigger.x - size.width - offset;
  const top = clamp(
    aligned(trigger.y, trigger.height, size.height, align, alignOffset),
    bounds.top,
    bounds.bottom - size.height
  );
  return {
    arrowOffset: clamp(
      trigger.y + trigger.height / 2 - top,
      arrowSize,
      size.height - arrowSize
    ),
    left: clamp(left, bounds.left, bounds.right - size.width),
    placement: resolved,
    top,
  };
};
