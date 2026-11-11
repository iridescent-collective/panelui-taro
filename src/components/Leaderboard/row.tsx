import { View } from "@tarojs/components";

import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import { withColorAlpha } from "../../lib/color";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Avatar } from "../Avatar";
import { Text } from "../primitives/Text";
import { describe, initials } from "./labels";
import { useLeaderboardPalette } from "./palette";
import type { PodiumEntryProps } from "./podium";
import { LeaderboardSlot } from "./slot";
import { leaderboardVariants } from "./variants";

const ChangeLabel = ({ change }: { change?: number }) => {
  const success = useThemeToken("success");
  const destructive = useThemeToken("destructive");
  const slots = leaderboardVariants();
  if (change === undefined) {
    return null;
  }
  if (change === 0) {
    return (
      <View aria-hidden className={cn("flex", slots.change())}>
        <Text size="xs" muted className="tabular-nums">
          –
        </Text>
      </View>
    );
  }
  const up = change > 0;
  const color = up ? success : destructive;
  const Arrow = up ? ArrowUpIcon : ArrowDownIcon;
  return (
    <View aria-hidden className={cn("flex", slots.change())}>
      <Arrow size={11} strokeWidth={2.5} color={color} />
      <Text
        size="xs"
        weight="medium"
        className="tabular-nums"
        style={{ color }}
      >
        {Math.abs(change)}
      </Text>
    </View>
  );
};
export const LeaderboardRow = ({
  item,
  label,
  highlightId,
  unit,
  onPress,
  index,
}: Omit<PodiumEntryProps, "place" | "height"> & { index: number }) => {
  const slots = leaderboardVariants();
  const palette = useLeaderboardPalette();
  const highlighted = item.entry.id === highlightId;
  return (
    <View>
      {index > 0 && <View aria-hidden className={slots.rowDivider()} />}
      <LeaderboardSlot
        onPress={onPress}
        style={{
          backgroundColor: highlighted
            ? withColorAlpha(palette.primary, 0.1)
            : undefined,
        }}
        label={describe(item, label, unit)}
        className={slots.row()}
      >
        <Text
          className={slots.rank()}
          style={{ color: highlighted ? palette.primary : undefined }}
        >
          {item.rank}
        </Text>
        <Avatar
          size="sm"
          source={item.entry.avatar}
          fallback={initials(item.entry.name)}
        />
        <View className={cn("flex flex-col", slots.rowText())}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {item.entry.name}
          </Text>
          {item.entry.subtitle && (
            <Text size="xs" muted numberOfLines={1}>
              {item.entry.subtitle}
            </Text>
          )}
        </View>
        <Text className={slots.value()}>{label}</Text>
        <ChangeLabel change={item.entry.change} />
      </LeaderboardSlot>
    </View>
  );
};
