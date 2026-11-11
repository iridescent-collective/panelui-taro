import { View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronLeftIcon, XIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { useChartTween } from "../../primitives/chart-tween";
import { Button } from "../Button";
import { Text } from "../primitives/Text";
import type { TourOverlayProps } from "./types";

export const TourCard = ({
  props,
  frame,
  height,
  onMeasure,
}: {
  props: TourOverlayProps;
  frame: {
    left: number;
    top: number;
    width: number;
  };
  height: number | null;
  onMeasure: (height: number) => void;
}) => {
  const {
    active,
    dismissible,
    showProgress,
    total,
    index,
    words,
    showSkip,
    isLast,
    isFirst,
    onSkip,
    onNext,
    onBack,
    cardClassName,
  } = props;
  const measured = useElementLayout(true, active, undefined, false);
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    if (measured.layout) {
      onMeasure(measured.layout.height);
    }
  }, [measured.layout, onMeasure]);
  const fade = useChartTween(reduced ? 1 : 0);
  useEffect(() => {
    fade.timingTo(1, reduced ? 0 : 200);
  }, [reduced, fade.timingTo]);
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  return (
    <View
      className="fixed"
      style={{
        left: `${frame.left * 2}rpx`,
        opacity,
        top: `${frame.top * 2}rpx`,
        width: `${frame.width * 2}rpx`,
      }}
    >
      <View
        id={measured.id}
        aria-role="dialog"
        aria-live="polite"
        style={{ opacity: height === null ? 0 : 1 }}
        className={cn(
          "relative flex flex-col gap-[24px] rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-overlay)] p-[32px] shadow-lg",
          cardClassName
        )}
      >
        {dismissible ? (
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel={words.close}
            onPress={onSkip}
            className="absolute end-[8px] top-[8px] h-[72px] w-[72px]"
          >
            <XIcon size={16} />
          </Button>
        ) : null}
        <View className="flex flex-col gap-[8px] pe-[64px]">
          {showProgress && total > 1 && index >= 0 ? (
            <Text
              size="xs"
              muted
              aria-label={`Step ${index + 1} of ${total}`}
            >{`${index + 1} of ${total}`}</Text>
          ) : null}
          {active?.title ? (
            <Text
              aria-role="heading"
              weight="semibold"
              className="text-[var(--panel-overlay-foreground)]"
            >
              {active.title}
            </Text>
          ) : null}
          {active?.description ? (
            <Text size="sm" muted>
              {active.description}
            </Text>
          ) : null}
        </View>
        <View className="flex flex-row items-center justify-between gap-[16px]">
          <View className="flex flex-row items-center gap-[8px]">
            {showSkip && !isLast ? (
              <Button variant="ghost" size="sm" onPress={onSkip}>
                {words.skip}
              </Button>
            ) : null}
          </View>
          <View className="flex flex-row items-center gap-[16px]">
            {isFirst ? null : (
              <Button
                variant="outline"
                size="sm"
                onPress={onBack}
                startContent={<ChevronLeftIcon size={16} />}
              >
                {words.back}
              </Button>
            )}
            <Button variant="primary" size="sm" onPress={onNext}>
              {isLast ? words.done : words.next}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};
