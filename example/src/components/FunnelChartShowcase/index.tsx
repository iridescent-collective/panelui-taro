import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import {
  FunnelChart,
  useFunnelChart,
} from "panelui-taro/funnel-chart";
import type { FunnelChartHandle } from "panelui-taro/funnel-chart";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState } from "react";

const DATA = [
  { label: "Visits", value: 41_800 },
  { label: "Signed up", value: 18_200 },
  { label: "Checkout", value: 7400 },
  { label: "Paid", value: 3900 },
];
const Reading = () => {
  const selection = useFunnelChart();
  return (
    <Text size="xs" className="pt-[16px] break-all">
      {JSON.stringify(selection)}
    </Text>
  );
};
Reading.slot = "footer" as const;
export const FunnelChartShowcase = () => {
  const ref = useRef<FunnelChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [straight, setStraight] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Direction dir={rtl ? "rtl" : "ltr"}>
        <FunnelChart
          ref={ref}
          data={DATA}
          height={220}
          edges={straight ? "straight" : "curved"}
          status={loading ? "loading" : "ready"}
        >
          <FunnelChart.Header
            title="Conversion"
            value="41.8k"
            caption="Four stages"
          />
          <FunnelChart.Stages />
          <FunnelChart.Labels />
          <FunnelChart.Skeleton />
          <FunnelChart.Legend />
          <Reading />
        </FunnelChart>
      </Direction>
      <Button onPress={() => ref.current?.replay()}>Replay funnel</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show stages" : "Load funnel"}
      </Button>
      <Button onPress={() => setRtl(!rtl)}>
        {rtl ? "LTR funnel" : "RTL funnel"}
      </Button>
      <Button onPress={() => setStraight(!straight)}>
        {straight ? "Curved edges" : "Straight edges"}
      </Button>
    </View>
  );
};
