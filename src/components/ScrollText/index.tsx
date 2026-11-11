import { Text as NativeText, View } from "@tarojs/components";
import { useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useRevealProgress } from "../../hooks/use-reveal-progress";
import { interpolatePanelColor } from "../../lib/interpolate-color";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import type { ScrollTextProps, ScrollTextSplit } from "./types";

export type {
  ScrollTextProps,
  ScrollTextEffect,
  ScrollTextSplit,
} from "./types";
export const splitScrollText = (text: string, by: ScrollTextSplit) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }
  return by === "character" ? [...trimmed] : trimmed.split(/\s+/u);
};
export const ScrollText = ({
  className,
  children = "",
  effect = "color",
  by = "word",
  from,
  to,
  start = 0.9,
  end = 0.5,
  stagger = 0.35,
  progress: external,
  enabled = true,
  ...textProps
}: ScrollTextProps) => {
  const reduced = usePanelReducedMotion();
  const reveal = useRevealProgress({
    enabled: enabled && !reduced,
    end,
    id: textProps.id ?? textProps.nativeID,
    progress: external,
    start,
  });
  const muted = useThemeToken("muted-foreground");
  const foreground = useThemeToken("foreground");
  const accent = useThemeToken("accent");
  const dim = from ?? muted;
  const lit = to ?? foreground;
  const tokens = useMemo(() => splitScrollText(children, by), [children, by]);
  const span = Math.max(stagger, 0.01);
  const stride = tokens.length > 1 ? (1 - span) / (tokens.length - 1) : 0;
  if (effect === "rise") {
    return (
      <View id={reveal.id} className="flex flex-row flex-wrap items-baseline">
        {tokens.map((token, index) => {
          const local = Math.min(
            1,
            Math.max(0, (reveal.value - index * stride) / span)
          );
          return (
            <View
              key={`${index}-${token}`}
              style={{
                marginRight: index === tokens.length - 1 ? undefined : "12rpx",
                opacity: local,
                transform: `translateY(${(1 - local) * 36}rpx)`,
              }}
            >
              <Text
                {...textProps}
                id={undefined}
                nativeID={undefined}
                className={className}
              >
                {token}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
  return (
    <View id={reveal.id}>
      <Text
        {...textProps}
        id={undefined}
        nativeID={undefined}
        className={className}
      >
        {tokens.map((token, index) => {
          const local = Math.min(
            1,
            Math.max(0, (reveal.value - index * stride) / span)
          );
          return (
            <NativeText
              key={`${index}-${token}`}
              style={{
                backgroundColor:
                  effect === "highlight"
                    ? interpolatePanelColor("transparent", accent, local)
                    : undefined,
                color:
                  effect === "fade"
                    ? lit
                    : interpolatePanelColor(dim, lit, local),
                opacity: effect === "fade" ? 0.18 + 0.82 * local : undefined,
              }}
            >
              {index === tokens.length - 1 ? token : `${token} `}
            </NativeText>
          );
        })}
      </Text>
    </View>
  );
};
