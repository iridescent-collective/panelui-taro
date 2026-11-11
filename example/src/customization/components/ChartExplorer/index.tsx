import { View } from "@tarojs/components";
import { BarChart } from "panelui-taro/bar-chart";
import { LineChart } from "panelui-taro/line-chart";
import { Text } from "panelui-taro/primitives/text";
import { useThemeTokens } from "panelui-taro/theme";

import { CustomizationSection } from "../Section";
import { ThemeActions } from "../ThemeActions";

const DATA = [
  { month: "Jan", organic: 18, paid: 10, referral: 6 },
  { month: "Feb", organic: 26, paid: 16, referral: 12 },
  { month: "Mar", organic: 24, paid: 20, referral: 9 },
  { month: "Apr", organic: 38, paid: 24, referral: 18 },
];
const LABELS = { organic: "Organic", paid: "Paid", referral: "Referral" };
export const ChartExplorer = () => {
  const tokens = useThemeTokens();
  return (
    <>
      <CustomizationSection
        title="One series ramp"
        description="Five series colors are separate from success and destructive status colors. Switching to Sunset updates both rendered charts and the WXSS swatches."
      >
        <ThemeActions />
        <View className="customization-palette">
          {([1, 2, 3, 4, 5] as const).map((index) => (
            <View key={index} className="customization-palette-item">
              <View
                className="customization-swatch"
                style={{ backgroundColor: tokens[`chart-${index}`] }}
              />
              <Text size="xs">chart-{index}</Text>
            </View>
          ))}
        </View>
      </CustomizationSection>
      <CustomizationSection title="Choose by colorIndex">
        <LineChart data={DATA} xDataKey="month">
          <LineChart.Grid />
          <LineChart.Line dataKey="organic" />
          <LineChart.Line dataKey="paid" colorIndex={2} />
          <LineChart.Line dataKey="referral" colorIndex={3} />
          <LineChart.XAxis />
          <LineChart.YAxis />
          <LineChart.Header legend labels={LABELS} />
        </LineChart>
      </CustomizationSection>
      <CustomizationSection
        title="Override one series"
        description="The third bar uses the semantic info color explicitly; the first two follow the shared ramp."
      >
        <BarChart data={DATA} xDataKey="month">
          <BarChart.Grid />
          <BarChart.Bar dataKey="organic" />
          <BarChart.Bar dataKey="paid" colorIndex={2} />
          <BarChart.Bar dataKey="referral" color={tokens.info} />
          <BarChart.XAxis />
          <BarChart.YAxis />
          <BarChart.Legend labels={LABELS} />
        </BarChart>
      </CustomizationSection>
    </>
  );
};
