import { Image, View } from "@tarojs/components";

import { hsvToCss } from "../../lib/color";
import { useThemeToken } from "../../theme/use-theme";

export const Checkerboard = ({ square = 7 }: { square?: number }) => {
  const light = useThemeToken("background");
  const dark = useThemeToken("muted");
  return (
    <View
      aria-hidden
      className="absolute inset-0"
      style={{
        backgroundColor: light,
        backgroundImage: `linear-gradient(45deg, ${dark} 25%, transparent 25%),linear-gradient(-45deg, ${dark} 25%, transparent 25%),linear-gradient(45deg, transparent 75%, ${dark} 75%),linear-gradient(-45deg, transparent 75%, ${dark} 75%)`,
        backgroundPosition: `0 0,0 ${square * 2}rpx,${square * 2}rpx -${square * 2}rpx,-${square * 2}rpx 0`,
        backgroundSize: `${square * 4}rpx ${square * 4}rpx`,
        pointerEvents: "none",
      }}
    />
  );
};
const rad = (deg: number) => (deg * Math.PI) / 180;
const wheelPaths = Array.from({ length: 120 }, (_, index) => {
  const from = index * 3;
  const to = from + 3 + 0.6;
  const x1 = 50 + 50 * Math.cos(rad(from));
  const y1 = 50 + 50 * Math.sin(rad(from));
  const x2 = 50 + 50 * Math.cos(rad(to));
  const y2 = 50 + 50 * Math.sin(rad(to));
  return `<path d="M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z" fill="${hsvToCss(from, 1, 1, 1)}"/>`;
}).join("");
export const COLOR_WHEEL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="wash" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff" stop-opacity="1"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>${wheelPaths}<circle cx="50" cy="50" r="50" fill="url(#wash)"/></svg>`;
export const WheelDrawing = ({ diameter }: { diameter: number }) => (
  <Image
    aria-hidden
    mode="scaleToFill"
    src={`data:image/svg+xml,${encodeURIComponent(COLOR_WHEEL_SVG)}`}
    style={{
      display: "block",
      height: `${diameter * 2}rpx`,
      pointerEvents: "none",
      width: `${diameter * 2}rpx`,
    }}
  />
);
