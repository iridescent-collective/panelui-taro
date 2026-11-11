import { View } from "@tarojs/components";
import { useCallback, useMemo, useState } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { MarqueeGroupContext } from "./context";
import { PauseControl } from "./pause-control";
import type { MarqueeGroupProps } from "./types";

export const MarqueeGroup = ({
  className,
  children,
  playing = true,
  showPauseControl = true,
  pauseLabel = "Pause",
  playLabel = "Play",
  onPlayingChange,
  ...props
}: MarqueeGroupProps) => {
  const [userPaused, setUserPaused] = useState(false);
  const [liveRows, setLiveRows] = useState<ReadonlySet<string>>(
    () => new Set()
  );
  const reduced = usePanelReducedMotion();
  const report = useCallback((id: string, live: boolean) => {
    setLiveRows((current) => {
      if (current.has(id) === live) {
        return current;
      }
      const next = new Set(current);
      if (live) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);
  const value = useMemo(
    () => ({ paused: userPaused || !playing, report }),
    [userPaused, playing, report]
  );
  return (
    <MarqueeGroupContext.Provider value={value}>
      <View
        {...props}
        className={cn("flex w-full flex-col gap-[24px]", className)}
      >
        {children}
        {showPauseControl && playing && !reduced && liveRows.size > 0 && (
          <PauseControl
            paused={userPaused}
            pauseLabel={pauseLabel}
            playLabel={playLabel}
            onToggle={() => {
              const next = !userPaused;
              setUserPaused(next);
              onPlayingChange?.(!next);
            }}
          />
        )}
      </View>
    </MarqueeGroupContext.Provider>
  );
};
