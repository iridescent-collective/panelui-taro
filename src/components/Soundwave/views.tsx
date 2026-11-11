import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { withColorAlpha } from "../../lib/color";
import type { ObservableValue } from "../../primitives/observable-value";
import { FLOOR } from "./constants";
import { pillHeight } from "./geometry";
import { clamp01 } from "./math";
import type { WaveFrame } from "./types";

interface WaveViewProps {
  signal: ObservableValue<WaveFrame>;
  ink: string;
}
const Pill = ({
  signal,
  ink,
  index,
  count,
  width,
  height,
}: WaveViewProps & {
  index: number;
  count: number;
  width: number;
  height: number;
}) => {
  const frame = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  return (
    <View
      aria-hidden
      style={{
        backgroundColor: ink,
        borderRadius: `${width}rpx`,
        height: `${pillHeight(index, count, width, height, frame) * 2}rpx`,
        width: `${width * 2}rpx`,
      }}
    />
  );
};
export const PillsWave = ({
  signal,
  ink,
  count,
  width,
  height,
  gap,
}: WaveViewProps & {
  count: number;
  width: number;
  height: number;
  gap: number;
}) => (
  <View
    className="flex flex-row items-center justify-center"
    style={{ columnGap: `${gap * 2}rpx`, height: `${height * 2}rpx` }}
  >
    {Array.from({ length: count }, (_, index) => (
      <Pill
        key={index}
        index={index}
        count={count}
        signal={signal}
        ink={ink}
        width={width}
        height={height}
      />
    ))}
  </View>
);
export const AmbientWave = ({
  signal,
  ink,
  palette,
  radius,
}: WaveViewProps & { palette?: readonly string[]; radius: number }) => {
  const frame = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  const energy = clamp01(Math.max(FLOOR, frame.energy));
  const colors = palette?.length
    ? [
        withColorAlpha(palette[0] ?? ink, 0),
        ...palette.map((color, index) =>
          withColorAlpha(
            color,
            0.16 + (0.34 * index) / Math.max(1, palette.length - 1)
          )
        ),
      ]
    : [
        withColorAlpha(ink, 0),
        withColorAlpha(ink, 0.16),
        withColorAlpha(ink, 0.5),
      ];
  return (
    <View
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ borderRadius: `${radius * 2}rpx`, pointerEvents: "none" }}
    >
      <View
        className="absolute inset-0"
        style={{ opacity: 0.12 + 0.5 * energy }}
      >
        {[0, 1, 2].map((ring) => (
          <View
            key={ring}
            className="absolute inset-0 border-solid"
            style={{
              borderColor: withColorAlpha(ink, 0.4 - ring * 0.13),
              borderRadius: `${Math.max(0, radius - ring * 3) * 2}rpx`,
              borderWidth: "6rpx",
              margin: `${ring * 6}rpx`,
            }}
          />
        ))}
      </View>
      <View
        className="absolute inset-x-0 bottom-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${colors.join(", ")})`,
          height: "55%",
          opacity: 0.25 + 0.75 * energy,
          transform: `scaleY(${(0.72 + 0.4 * energy) * (0.94 + 0.06 * Math.sin(frame.clock * 1.7))})`,
          transformOrigin: "bottom",
        }}
      />
    </View>
  );
};
