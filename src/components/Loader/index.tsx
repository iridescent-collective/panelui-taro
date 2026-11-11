import { View } from "@tarojs/components";
import { memo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useIconColor } from "../../icons/context";
import { cn } from "../../lib/utils";
import { getRegisteredThemeTokens } from "../../theme/registry";
import { useTheme } from "../../theme/use-theme";
import { SIZE_SCALE } from "./constants";
import { LoaderPieces } from "./pieces";
import { LoaderShape } from "./shapes";
import type { LoaderProps } from "./types";
import { useLoaderClock } from "./use-clock";
import { loaderVariants } from "./variants";

export type { LoaderProps, LoaderVariant, LoaderSize } from "./types";
export const Loader = memo(
  ({
    variant = "pulse-dots",
    size = "md",
    color,
    speed = 1,
    label = "Loading",
    className,
    ...props
  }: LoaderProps) => {
    const reduced = usePanelReducedMotion();
    const animate = !reduced && speed > 0;
    const scale = SIZE_SCALE[size];
    const time = useLoaderClock(animate, speed > 0 ? speed : 1, variant, scale);
    const inherited = useIconColor();
    const { theme } = useTheme();
    const tokens: Readonly<Record<string, string>> =
      getRegisteredThemeTokens(theme);
    const isToken = typeof color === "string" && color.startsWith("--");
    const resolved = tokens[isToken ? color.slice(8) : "foreground"];
    const ink =
      (isToken ? resolved : color) ?? inherited ?? resolved ?? "#0a0a0a";
    return (
      <View
        role="progressbar"
        aria-role="progressbar"
        aria-label={label}
        className={cn("flex", loaderVariants({ className }))}
        {...props}
      >
        {variant === "liquid-dots" ||
        variant === "wave-physics" ||
        variant === "morph-ring" ? (
          <LoaderShape
            variant={variant}
            scale={scale}
            ink={ink}
            time={time}
            animate={animate}
          />
        ) : (
          <LoaderPieces
            variant={variant}
            scale={scale}
            ink={ink}
            time={time}
            animate={animate}
          />
        )}
      </View>
    );
  }
);
Loader.displayName = "Loader";
