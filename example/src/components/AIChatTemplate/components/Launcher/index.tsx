import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";

import { openPage } from "@/services/routes";

import { AI_TEMPLATE_URL } from "../../constant";

export const AIChatTemplateLauncher = () => (
  <View className="flex flex-col gap-[24px]">
    <Text className="block text-[48px] font-semibold">PanelUI Assistant</Text>
    <Text muted>
      Official chat patterns, composed into one complete interface. Messages,
      streaming, tools, plans, sources and voice preview.
    </Text>
    <Button onPress={() => openPage(AI_TEMPLATE_URL)}>Open AI template</Button>
  </View>
);
