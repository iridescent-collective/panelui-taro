import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Leaderboard } from "panelui-taro/leaderboard";
import type { LeaderboardPodium } from "panelui-taro/leaderboard";
import { Select } from "panelui-taro/select";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { PODIUM_OPTIONS, RANKING_ENTRIES } from "./constants";

export const LeaderboardShowcase = () => {
  const [podium, setPodium] = useState<LeaderboardPodium>("bars");
  const [ascending, setAscending] = useState(false);
  const [selected, setSelected] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">
        Leaderboard · 排名与领奖台
      </Typography.Heading>
      <Select
        value={podium}
        valueLabel={podium}
        title="展示方式"
        onValueChange={(next) => {
          const value = PODIUM_OPTIONS.find((entry) => entry === next);
          if (value) {
            setPodium(value);
          }
        }}
      >
        {PODIUM_OPTIONS.map((entry) => (
          <Select.Item key={entry} value={entry} label={entry} />
        ))}
      </Select>
      <Button
        className="panel-leaderboard-order"
        variant="outline"
        onPress={() => setAscending(!ascending)}
      >
        {ascending ? "切换降序" : "切换升序"}
      </Button>
      <Leaderboard
        id="panel-leaderboard"
        data={RANKING_ENTRIES}
        podium={podium}
        order={ascending ? "asc" : "desc"}
        limit={4}
        highlightId="kai"
        unit="steps"
        onPressEntry={(entry, rank) =>
          setSelected(`${entry.name} · Rank ${rank}`)
        }
      />
      <Typography id="panel-leaderboard-result">
        {selected || "选择排名项"}
      </Typography>
    </View>
  );
};
