import { View } from "@tarojs/components";
import { useContext } from "react";

import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { PanelIndexContext, useSplitter } from "./context";
import type { SplitterPanelProps } from "./types";
import { splitterVariants } from "./variants";

export const SplitterPanel = ({
  className,
  children,
  style,
  defaultSize: _defaultSize,
  minSize: _minSize,
  maxSize: _maxSize,
  collapsible: _collapsible,
  collapsedSize: _collapsedSize,
  ...props
}: SplitterPanelProps) => {
  const context = useSplitter("Splitter.Panel");
  const index = useContext(PanelIndexContext);
  const horizontal = context.orientation === "horizontal";
  const size = (context.available * (context.layout[index] ?? 0)) / 100;
  const live = horizontal
    ? { width: `${size * 2}rpx` }
    : { height: `${size * 2}rpx` };
  const unmeasured = context.measured
    ? {}
    : { flexBasis: 0, flexGrow: context.settled[index] ?? 0, flexShrink: 1 };
  return (
    <View
      {...props}
      className={cn(
        "flex flex-col",
        splitterVariants({ orientation: context.orientation }).panel({
          className,
        })
      )}
      style={mergeStyleAfter(mergeStyle(unmeasured, style), live)}
    >
      {children}
    </View>
  );
};
