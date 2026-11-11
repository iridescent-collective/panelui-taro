import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";

import { openPage } from "@/services/routes";

import { TEMPLATE_URL } from "../../constant";
import { Text } from "../Text";

export const OfficialTemplateLauncher = () => (
  <View className="flex flex-col gap-[24px]">
    <Text className="text-[48px] font-semibold">Daily Life</Text>
    <Text muted>
      Official PanelUI blocks, composed into a complete five-screen demo. Home ·
      Wallet · Activity · Travel · Settings.
    </Text>
    <Button onPress={() => openPage(TEMPLATE_URL)}>Open full template</Button>
  </View>
);
