import { View } from "@tarojs/components";
import { BumpChart } from "panelui-taro/bump-chart";
import type { BumpChartHandle } from "panelui-taro/bump-chart";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState } from "react";

const FIRST = [
  { a: 1, b: 2, c: 3, date: "Week 1" },
  { a: 2, b: 1, c: 3, date: "Week 2" },
  { a: 3, b: 2, c: 1, date: "Week 3" },
  { a: 2, b: 3, c: 1, date: "Week 4" },
];
const SECOND = [
  { a: 2, b: 1, c: 3, date: "Week 1" },
  { a: 1, b: 3, c: 2, date: "Week 2" },
  { a: 1, b: 2, c: 3, date: "Week 3" },
  { a: 3, b: 1, c: 2, date: "Week 4" },
];
export const BumpChartShowcase = () => {
  const ref = useRef<BumpChartHandle>(null);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  return (
    <View className="flex flex-col gap-[24px]">
      <Text size="xs" muted>
        Tap a team to highlight · scrub columns · interrupted morph
      </Text>
      <BumpChart
        ref={ref}
        data={changed ? SECOND : FIRST}
        defaultHighlight="c"
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={setActive}
      >
        <BumpChart.Header
          title="League standings"
          value="3 teams"
          caption={active < 0 ? "Four weeks" : `Week ${active + 1}`}
        />
        <BumpChart.Grid />
        <BumpChart.Line dataKey="a" label="Harbour" colorIndex={1} />
        <BumpChart.Line dataKey="b" label="Northside" colorIndex={2} />
        <BumpChart.Line dataKey="c" label="Westfield" colorIndex={3} />
        <BumpChart.Skeleton />
        <BumpChart.YAxis />
        <BumpChart.XAxis />
        <BumpChart.Labels />
        <BumpChart.Tooltip />
      </BumpChart>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button onPress={() => setChanged((value) => !value)}>
          Change ranks
        </Button>
        <Button
          variant="secondary"
          onPress={() => setLoading((value) => !value)}
        >
          Loading
        </Button>
        <Button variant="ghost" onPress={() => ref.current?.replay()}>
          Replay
        </Button>
      </View>
    </View>
  );
};
