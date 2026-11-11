import { View } from "@tarojs/components";

import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Path } from "../../primitives/static-svg";
import { GEOMETRY } from "./constants";
import { liquidGeometry, waveGeometry, repeatValue } from "./geometry";
import type { LoaderVariant } from "./types";

const Ellipse = "ellipse" as const;
export const LoaderShape = ({
  variant,
  scale,
  ink,
  time,
  animate,
}: {
  variant: Extract<
    LoaderVariant,
    "liquid-dots" | "wave-physics" | "morph-ring"
  >;
  scale: number;
  ink: string;
  time: number;
  animate: boolean;
}) => {
  if (variant === "liquid-dots") {
    const geometry = liquidGeometry(
      scale,
      animate ? repeatValue(time, 0, 2000, -1, 1) : -0.35
    );
    return (
      <CanvasGraphics
        width={geometry.width}
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      >
        <Path d={geometry.path} fill={ink} fillRule="nonzero" />
      </CanvasGraphics>
    );
  }
  if (variant === "wave-physics") {
    const geometry = waveGeometry(scale, time, animate);
    return (
      <CanvasGraphics
        width={geometry.width}
        height={geometry.height}
        viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      >
        <Path
          d={geometry.path}
          stroke={ink}
          strokeWidth={geometry.barWidth}
          strokeLinecap="round"
          fill="none"
          opacity={0.55}
        />
        <Ellipse {...geometry.ball} fill={ink} />
      </CanvasGraphics>
    );
  }
  const g = GEOMETRY["morph-ring"];
  const box = g.box * scale;
  const border = Math.max(2, g.border * scale);
  const progress = animate ? repeatValue(time, 0, 2000, 0, 1) : 0.5;
  const overhang = (box * Math.SQRT2 - box) / 2;
  return (
    <View style={{ padding: `${overhang * 2}rpx` }}>
      <View
        style={{
          borderColor: ink,
          borderRadius: `${box * (0.1 + progress * 0.4) * 2}rpx`,
          borderStyle: "solid",
          borderWidth: `${border * 2}rpx`,
          boxSizing: "border-box",
          height: `${box * 2}rpx`,
          transform: `rotate(${progress * 180}deg)`,
          width: `${box * 2}rpx`,
        }}
      />
    </View>
  );
};
