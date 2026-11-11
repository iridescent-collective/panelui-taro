import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Circle, G } from "../../primitives/static-svg";

export const SectionProgressRing = ({
  fill,
  tint,
  track,
}: {
  fill: number;
  tint: string;
  track: string;
}) => {
  const circumference = 2 * Math.PI * 9.75;
  return (
    <CanvasGraphics width={22} height={22} viewBox="0 0 22 22">
      <G>
        <Circle
          cx={11}
          cy={11}
          r={9.75}
          stroke={track}
          strokeWidth={2.5}
          fill="none"
        />
        <Circle
          cx={11}
          cy={11}
          r={9.75}
          stroke={tint}
          strokeDasharray={`${circumference * fill} ${circumference}`}
          strokeWidth={2.5}
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90 11 11)"
        />
      </G>
    </CanvasGraphics>
  );
};
