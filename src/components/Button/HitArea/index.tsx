import { View } from "@tarojs/components";

export interface HitAreaProps {
  inset:
    | number
    | { top?: number; bottom?: number; left?: number; right?: number };
}
export const HitArea = ({ inset }: HitAreaProps) => {
  const edges =
    typeof inset === "number"
      ? { bottom: inset, left: inset, right: inset, top: inset }
      : inset;
  return (
    <View
      aria-hidden
      className="panelui-button-hit-area"
      style={{
        bottom: `${-(edges.bottom ?? 0) * 2}rpx`,
        left: `${-(edges.left ?? 0) * 2}rpx`,
        right: `${-(edges.right ?? 0) * 2}rpx`,
        top: `${-(edges.top ?? 0) * 2}rpx`,
      }}
    />
  );
};
