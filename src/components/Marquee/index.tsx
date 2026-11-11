import { ScrollView, View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { MarqueeGroup } from "./group";
import { DEFAULT_MARQUEE_SPEED } from "./marquee-math";
import { PauseControl } from "./pause-control";
import type { MarqueeProps } from "./types";
import { useMarqueeLoop } from "./use-loop";

export type {
  MarqueeProps,
  MarqueeGroupProps,
  MarqueeDirection,
} from "./types";

const MarqueeRoot = ({
  className,
  children,
  speed: speedProp = DEFAULT_MARQUEE_SPEED,
  spacing = 0,
  direction = "horizontal",
  reverse = false,
  playing = true,
  showPauseControl,
  pauseLabel = "Pause",
  playLabel = "Play",
  onPlayingChange,
  style,
  onLayout,
  ...props
}: MarqueeProps) => {
  const horizontal = direction === "horizontal";
  const {
    reduced,
    viewport,
    content,
    contentLength,
    layout,
    userPaused,
    showControl,
    travel,
    toggle,
  } = useMarqueeLoop(
    {
      children,
      className,
      id: props.id,
      onLayout,
      onPlayingChange,
      showPauseControl,
      style,
    },
    horizontal,
    speedProp,
    spacing,
    playing,
    reverse
  );
  if (reduced) {
    return (
      <View
        {...props}
        id={viewport.id}
        className={cn("overflow-hidden", className)}
        style={style}
      >
        {children}
      </View>
    );
  }
  return (
    <View
      {...props}
      className={cn("flex flex-col gap-[24px]", className)}
      style={style}
    >
      <View id={viewport.id} className="relative flex-1 overflow-hidden">
        <ScrollView
          scrollX={horizontal}
          scrollY={!horizontal}
          aria-hidden
          className="pointer-events-none"
          style={{
            height: horizontal ? undefined : "100%",
            opacity: 0,
            zIndex: -1,
          }}
        >
          <View
            id={content.id}
            style={{
              height: horizontal ? undefined : "max-content",
              width: horizontal ? "max-content" : "100%",
            }}
          >
            {children}
          </View>
        </ScrollView>
        <View
          className="panelui-marquee-track absolute inset-0"
          style={{
            transform: horizontal
              ? `translateX(${travel * 2}rpx)`
              : `translateY(${travel * 2}rpx)`,
          }}
        >
          {Array.from({ length: layout.count }, (_, index) => (
            <View
              key={`copy-${index}`}
              aria-hidden={index !== 1}
              className={cn("absolute", index !== 1 && "pointer-events-none")}
              style={mergeStyle(
                horizontal
                  ? {
                      left: `${(index - 1) * layout.period * 2}rpx`,
                      width: `${contentLength * 2}rpx`,
                    }
                  : {
                      top: `${(index - 1) * layout.period * 2}rpx`,
                      width: "100%",
                    }
              )}
            >
              {children}
            </View>
          ))}
        </View>
      </View>
      {showControl && (
        <PauseControl
          paused={userPaused}
          pauseLabel={pauseLabel}
          playLabel={playLabel}
          onToggle={toggle}
        />
      )}
    </View>
  );
};
export const Marquee = Object.assign(MarqueeRoot, { Group: MarqueeGroup });
