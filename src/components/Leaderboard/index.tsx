import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { PodiumEntry } from "./podium";
import { LeaderboardRow } from "./row";
import type { LeaderboardProps } from "./types";
import { useLeaderboardModel } from "./use-model";
import { leaderboardVariants } from "./variants";

export { rankEntries } from "./leaderboard-rank";
export type { Ranked as LeaderboardRanked } from "./leaderboard-rank";
export type {
  LeaderboardEntry,
  LeaderboardPodium,
  LeaderboardProps,
} from "./types";
export const Leaderboard = forwardRef<
  ComponentRef<typeof View>,
  LeaderboardProps
>((props, ref) => {
  const model = useLeaderboardModel(props);
  const {
    className,
    data: _data,
    podium: _podium,
    order: _order,
    podiumScale: _podiumScale,
    podiumHeight: _podiumHeight,
    limit: _limit,
    highlightId,
    formatValue: _formatValue,
    unit,
    onPressEntry,
    emptyText: _emptyText,
    ...native
  } = props;
  const slots = leaderboardVariants();
  const press = (item: (typeof model.ranked)[number]) =>
    onPressEntry ? () => onPressEntry(item.entry, item.rank) : undefined;
  return (
    <View
      {...native}
      ref={ref}
      className={cn("flex flex-col", slots.root({ className }))}
    >
      {model.ranked.length === 0 && (
        <View className={cn("flex", slots.empty())}>
          <Text size="sm" muted>
            {model.emptyText}
          </Text>
        </View>
      )}
      {model.podium !== "none" && model.seats.length > 0 && (
        <View
          className={cn(
            "flex",
            model.podium === "bars"
              ? slots.podium()
              : "flex-row items-end gap-[16px]"
          )}
        >
          {model.seats.map(({ item, place }, index) => (
            <PodiumEntry
              key={item.entry.id}
              item={item}
              place={place}
              label={model.formatValue(item.entry.value)}
              highlightId={highlightId}
              unit={unit}
              onPress={press(item)}
              cards={model.podium === "cards"}
              height={Math.round(
                model.podiumHeight * (model.heights[index] ?? 0)
              )}
            />
          ))}
        </View>
      )}
      {(model.rest.length > 0 || model.pinned) && (
        <View role="list" aria-role="list" className={slots.list()}>
          {model.rest.map((item, index) => (
            <LeaderboardRow
              key={item.entry.id}
              item={item}
              label={model.formatValue(item.entry.value)}
              highlightId={highlightId}
              unit={unit}
              onPress={press(item)}
              index={index}
            />
          ))}
          {model.pinned && (
            <>
              {model.rest.length > 0 && (
                <View aria-hidden className={cn("flex", slots.gap())}>
                  {[0, 1, 2].map((dot) => (
                    <View key={dot} className={slots.gapDot()} />
                  ))}
                </View>
              )}
              <LeaderboardRow
                item={model.pinned}
                label={model.formatValue(model.pinned.entry.value)}
                highlightId={highlightId}
                unit={unit}
                onPress={press(model.pinned)}
                index={0}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
});
