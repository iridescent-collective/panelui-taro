import { Text } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { useChartTween } from "../../primitives/chart-tween";
import { CARET_PERIOD } from "./constants";
import { textAnimationVariants } from "./variants";

export const TypingCaret = ({
  blinking,
  still,
  className,
}: {
  blinking: boolean;
  still: boolean;
  className?: string;
}) => {
  const tween = useChartTween(1);
  const opacity = useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
  useEffect(() => {
    tween.setImmediate(1);
    if (still || !blinking) {
      return;
    }
    let target = 0;
    const timer = setInterval(() => {
      tween.timingTo(target, CARET_PERIOD);
      target = 1 - target;
    }, CARET_PERIOD);
    return () => {
      clearInterval(timer);
      tween.stop();
    };
  }, [blinking, still, tween.setImmediate, tween.timingTo, tween.stop]);
  return (
    <Text
      aria-hidden
      style={{ opacity }}
      className={textAnimationVariants().caret({ className })}
    >
      {"\u258F"}
    </Text>
  );
};
