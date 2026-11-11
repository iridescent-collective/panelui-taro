import { useId } from "react";
import type { ReactNode } from "react";

import {
  StaticSvg as Svg,
  Circle,
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
} from "../../primitives/static-svg";

export type ThemePreviewMode = "system" | "light" | "dark";

export type ThemePreviewVariant = "window" | "card";

interface Palette {
  ground: string;

  surface: string;

  mark: string;

  line: string;
}

const PALETTE: Record<"light" | "dark", Palette> = {
  dark: {
    ground: "#171717",
    line: "#404040",
    mark: "#525252",
    surface: "#262626",
  },
  light: {
    ground: "#e5e5e5",
    line: "#e5e5e5",
    mark: "#d4d4d4",
    surface: "#ffffff",
  },
};

const ACCENT = "#c1704f";

const VIEW_BOX = { height: 70, width: 88 };

const DIAGONAL = `M${VIEW_BOX.width} 0V${VIEW_BOX.height}H0Z`;

const WindowHalf = ({
  palette,
  side,
}: {
  palette: Palette;
  side: "left" | "right" | "full";
}) => {
  if (side === "full") {
    return (
      <>
        <Rect x={0} y={0} width={88} height={70} fill={palette.ground} />
        <Path d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z" fill={palette.surface} />
        <Circle cx={28} cy={26} r={8} fill={palette.mark} />
        <Rect x={20} y={42} width={58} height={4} rx={2} fill={palette.line} />
        <Rect x={20} y={49} width={58} height={4} rx={2} fill={palette.line} />
        <Rect x={20} y={56} width={29} height={4} rx={2} fill={palette.line} />
      </>
    );
  }

  const x = side === "left" ? 0 : 44;
  return (
    <>
      <Rect x={x} y={0} width={44} height={70} fill={palette.ground} />
      {side === "left" ? (
        <>
          <Path d="M10 12a4 4 0 0 1 4-4h30v62H10V12Z" fill={palette.surface} />
          <Circle cx={28} cy={26} r={8} fill={palette.mark} />
          <Rect
            x={20}
            y={42}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
          <Rect
            x={20}
            y={49}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
          <Rect
            x={20}
            y={56}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
        </>
      ) : (
        <>
          <Path d="M54 12a4 4 0 0 1 4-4h30v62H54V12Z" fill={palette.surface} />
          <Circle cx={72} cy={26} r={8} fill={palette.mark} />
          <Rect
            x={64}
            y={42}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
          <Rect
            x={64}
            y={49}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
          <Rect
            x={64}
            y={56}
            width={24}
            height={4}
            rx={2}
            fill={palette.line}
          />
        </>
      )}
    </>
  );
};

const CARD_FRAME = { height: 70, rx: 16, width: 88, x: 0, y: 0 } as const;
const CARD_SURFACE = { height: 54, rx: 10, width: 72, x: 8, y: 8 } as const;

const CardBody = ({ palette }: { palette: Palette }) => (
  <>
    <Rect {...CARD_FRAME} fill={palette.ground} />
    <Rect {...CARD_SURFACE} fill={palette.surface} />
    <Rect x={17} y={18} width={34} height={4} rx={2} fill={palette.line} />
    <Rect x={17} y={26} width={23} height={4} rx={2} fill={palette.line} />
  </>
);

export interface ThemePreviewProps {
  mode: ThemePreviewMode;
  variant?: ThemePreviewVariant;
  width: number;
}

export const ThemePreview = ({
  mode,
  variant = "window",
  width,
}: ThemePreviewProps): ReactNode => {
  const height = Math.round((width / VIEW_BOX.width) * VIEW_BOX.height);

  const clip = `panelui-theme-${useId().replaceAll(/[^a-zA-Z0-9-]/gu, "")}`;

  if (variant === "card") {
    return (
      <Svg width={width} height={height} viewBox="0 0 88 70">
        {CardBody({ palette: PALETTE[mode === "dark" ? "dark" : "light"] })}

        {mode === "system" ? (
          <>
            <Defs>
              <ClipPath id={`${clip}-frame`}>
                <Rect {...CARD_FRAME} />
              </ClipPath>
              <ClipPath id={`${clip}-card`}>
                <Rect {...CARD_SURFACE} />
              </ClipPath>
            </Defs>
            <G clipPath={`url(#${clip}-frame)`}>
              <Path d={DIAGONAL} fill={PALETTE.dark.ground} />
            </G>
            <G clipPath={`url(#${clip}-card)`}>
              <Path d={DIAGONAL} fill={PALETTE.dark.surface} />
            </G>
          </>
        ) : null}

        <Circle cx={64} cy={47} r={8} fill={ACCENT} />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 88 70">
      {mode === "system" ? (
        <>
          {WindowHalf({ palette: PALETTE.light, side: "left" })}
          {WindowHalf({ palette: PALETTE.dark, side: "right" })}
        </>
      ) : (
        WindowHalf({ palette: PALETTE[mode], side: "full" })
      )}
    </Svg>
  );
};
