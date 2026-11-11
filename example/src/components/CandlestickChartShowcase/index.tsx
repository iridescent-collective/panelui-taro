import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { CandlestickChart } from "panelui-taro/candlestick-chart";
import type {
  CandlestickChartHandle,
  CandlestickChartDatum,
} from "panelui-taro/candlestick-chart";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState } from "react";

const DATA = Array.from({ length: 24 }, (_, index) => {
  const open = 100 + Math.sin(index * 0.7) * 6 + index / 2;
  const close = open + Math.sin(index * 1.2) * 4;
  return {
    close,
    date: `Oct${index + 1}`,
    high: Math.max(open, close) + 2,
    low: Math.min(open, close) - 3,
    open,
  };
});
export const CandlestickChartShowcase = () => {
  const ref = useRef<CandlestickChartHandle>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<CandlestickChartDatum | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <CandlestickChart
        ref={ref}
        data={DATA}
        status={loading ? "loading" : "ready"}
        onActiveIndexChange={(_index, datum) => setActive(datum)}
      >
        <CandlestickChart.Header
          title="Session prices"
          value={active ? String(active.close) : "Latest close"}
          legend
        />
        <CandlestickChart.Grid />
        <CandlestickChart.Candles />
        <CandlestickChart.XAxis />
        <CandlestickChart.YAxis />
        <CandlestickChart.Tooltip />
      </CandlestickChart>
      <Text size="xs">{JSON.stringify(active)}</Text>
      <Button onPress={() => ref.current?.replay()}>Replay candles</Button>
      <Button onPress={() => setLoading(!loading)}>
        {loading ? "Show prices" : "Load candles"}
      </Button>
    </View>
  );
};
