import { View } from "@tarojs/components";
import { useState } from "react";

import { PageLayout } from "@/components/navigation/PageLayout";

import { ActivityScreen } from "./components/Activity";
import { TemplateHeader } from "./components/Header";
import { HomeScreen } from "./components/Home";
import { TemplateNavigation } from "./components/Navigation";
import { SettingsScreen } from "./components/Settings";
import { TravelScreen } from "./components/Travel";
import { WalletScreen } from "./components/Wallet";
import { SCREENS } from "./constant";

const SCREEN_COMPONENTS = [
  HomeScreen,
  WalletScreen,
  ActivityScreen,
  TravelScreen,
  SettingsScreen,
];
export const OfficialTemplate = ({ onBack }: { onBack?: () => void }) => {
  const [active, setActive] = useState<string>(SCREENS[0].id);
  const [visited, setVisited] = useState<string[]>([SCREENS[0].id]);
  const selectScreen = (value: string) => {
    setActive(value);
    setVisited((current) =>
      current.includes(value) ? current : [...current, value]
    );
  };
  return (
    <PageLayout
      style={{ background: "var(--panel-background)" }}
      header={<TemplateHeader value={active} onBack={onBack} />}
      footer={<TemplateNavigation value={active} onChange={selectScreen} />}
    >
      <View className="px-[36px] pt-[8px] pb-[48px]">
        {SCREENS.map((screen, index) => {
          if (!visited.includes(screen.id)) {
            return null;
          }
          const Screen = SCREEN_COMPONENTS[index];
          return (
            <View
              key={screen.id}
              hidden={active !== screen.id}
              className={active === screen.id ? "block" : "hidden"}
            >
              <Screen />
            </View>
          );
        })}
      </View>
    </PageLayout>
  );
};
