import { ScrollView, View } from "@tarojs/components";
import { Text } from "panelui-taro/primitives/text";

import { DocsShell } from "@/components/docs/DocsShell";
import entries from "@/data/customization.json";

import { ChartExplorer } from "../ChartExplorer";
import { ColorExplorer } from "../ColorExplorer";
import { FontExplorer } from "../FontExplorer";
import { IconExplorer } from "../IconExplorer";
import { SizingExplorer } from "../SizingExplorer";
import { StylingExplorer } from "../StylingExplorer";
import { ThemeExplorer } from "../ThemeExplorer";

const EXPLORERS = {
  charts: ChartExplorer,
  colors: ColorExplorer,
  fonts: FontExplorer,
  icons: IconExplorer,
  sizing: SizingExplorer,
  styling: StylingExplorer,
  theming: ThemeExplorer,
};
export const CustomizationPage = ({
  slug,
}: {
  slug: keyof typeof EXPLORERS;
}) => {
  const entry = entries.find((item) => item.slug === slug);
  const Explorer = EXPLORERS[slug];
  return (
    <DocsShell section="customization" slug={slug}>
      <ScrollView scrollY enhanced className="customization-scroll">
        <View className="customization-content">
          <Text size="sm" muted className="customization-intro">
            {entry?.summary}
          </Text>
          <Explorer />
        </View>
      </ScrollView>
    </DocsShell>
  );
};
