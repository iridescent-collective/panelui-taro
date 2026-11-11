import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { withColorAlpha } from "../../lib/color";
import { cn } from "../../lib/utils";
import { Avatar } from "../Avatar";
import { Text } from "../primitives/Text";
import { describe, initials } from "./labels";
import type { Ranked } from "./leaderboard-rank";
import { useLeaderboardPalette } from "./palette";
import { LeaderboardSlot } from "./slot";
import type { LeaderboardEntry } from "./types";
import { useBarHeight } from "./use-bar-height";
import { leaderboardVariants } from "./variants";

export interface PodiumEntryProps {
  item: Ranked<LeaderboardEntry>;
  place: 1 | 2 | 3;
  label: string;
  highlightId?: string;
  unit?: string;
  onPress?: () => void;
  cards?: boolean;
  height: number;
}
const RankBadge = ({ place, rank }: { place: 1 | 2 | 3; rank: number }) => {
  const palette = useLeaderboardPalette();
  return (
    <View
      className={cn("flex", leaderboardVariants().rankBadge())}
      style={{
        backgroundColor: place === 1 ? palette.primary : palette.foreground,
      }}
    >
      <Text
        className="text-[20px] font-bold tabular-nums"
        style={{
          color: place === 1 ? palette.primaryForeground : palette.background,
        }}
      >
        {rank}
      </Text>
    </View>
  );
};
const PodiumBar = ({
  place,
  height,
  rank,
}: {
  place: 1 | 2 | 3;
  height: number;
  rank: number;
}) => {
  const reduced = usePanelReducedMotion();
  const palette = useLeaderboardPalette();
  const grown = useBarHeight(height, (3 - place) * 110, reduced);
  return (
    <View
      aria-hidden
      className={cn("flex flex-col", leaderboardVariants().bar())}
      style={{ backgroundColor: palette.bar[place], height: `${grown * 2}rpx` }}
    >
      <View style={{ opacity: Math.min(1, Math.max(0, (grown - 28) / 24)) }}>
        <Text
          size={place === 1 ? "3xl" : "2xl"}
          weight="bold"
          className="tabular-nums"
          style={{
            color:
              place === 1
                ? palette.primaryForeground
                : withColorAlpha(palette.foreground, 0.7),
          }}
        >
          {rank}
        </Text>
      </View>
    </View>
  );
};
export const PodiumEntry = ({
  item,
  place,
  label,
  highlightId,
  unit,
  onPress,
  cards,
  height,
}: PodiumEntryProps) => {
  const slots = leaderboardVariants();
  const palette = useLeaderboardPalette();
  const highlighted = item.entry.id === highlightId;
  let cardBorder: string | undefined;
  if (highlighted) {
    cardBorder = withColorAlpha(palette.primary, 0.4);
  }
  if (place === 1) {
    cardBorder = palette.primary;
  }
  const avatar = (
    <View className="relative mb-[12px] flex flex-col items-center">
      <Avatar
        size={place === 1 ? "lg" : "md"}
        source={item.entry.avatar}
        fallback={initials(item.entry.name)}
        style={{
          borderColor:
            place === 1
              ? palette.primary
              : withColorAlpha(palette.primary, 0.6),
          borderStyle: "solid",
          borderWidth: place === 1 || (!cards && highlighted) ? "4rpx" : 0,
        }}
      />
      <RankBadge place={place} rank={item.rank} />
    </View>
  );
  const title = (
    <Text size="sm" weight="semibold" numberOfLines={1} className="text-center">
      {item.entry.name}
    </Text>
  );
  if (cards) {
    return (
      <LeaderboardSlot
        onPress={onPress}
        label={describe(item, label, unit)}
        style={{
          borderColor: cardBorder,
        }}
        className={cn(
          slots.card(),
          place === 1 && "pt-[40px] pb-[40px] shadow-sm"
        )}
      >
        {avatar}
        {title}
        <Text
          size={place === 1 ? "base" : "sm"}
          weight="bold"
          numberOfLines={1}
          className="tabular-nums"
          style={{ color: place === 1 ? palette.primary : undefined }}
        >
          {label}
        </Text>
        {item.entry.subtitle && (
          <Text size="xs" muted numberOfLines={1}>
            {item.entry.subtitle}
          </Text>
        )}
      </LeaderboardSlot>
    );
  }
  return (
    <LeaderboardSlot
      onPress={onPress}
      label={describe(item, label, unit)}
      className={slots.column()}
    >
      <View className={cn("flex flex-col", slots.person())}>
        {avatar}
        {title}
        <Text size="xs" muted numberOfLines={1} className="tabular-nums">
          {label}
        </Text>
      </View>
      <PodiumBar place={place} rank={item.rank} height={height} />
    </LeaderboardSlot>
  );
};
