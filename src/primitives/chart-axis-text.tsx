import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../components/primitives/Text";
import type { TextProps } from "../components/primitives/Text";
import { useFontScale } from "../hooks/use-font-scale";
import { mergeStyle } from "../lib/styles";
import { CHART_AXIS_MAX_FONT_SCALE } from "./chart-accessibility";

export const useAxisLabelScale = () =>
  Math.min(Math.max(useFontScale(), 1), CHART_AXIS_MAX_FONT_SCALE);
export const ChartAxisText = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ style, ...props }, ref) => {
    const scale = Math.min(useFontScale(), CHART_AXIS_MAX_FONT_SCALE);
    return (
      <Text
        {...props}
        ref={ref}
        style={mergeStyle({ fontSize: `${24 * scale}rpx` }, style)}
      />
    );
  }
);
