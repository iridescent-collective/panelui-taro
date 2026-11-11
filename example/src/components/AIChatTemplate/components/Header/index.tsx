import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { MenuIcon, PlusIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";

import { ThemeControl } from "@/components/docs/ThemeControl";

export const ChatHeader = ({
  title,
  onHistory,
  onNew,
}: {
  title: string;
  onHistory: () => void;
  onNew: () => void;
}) => {
  return (
    <View className="flex flex-col gap-[20px] px-[32px] pt-[24px] pb-[24px]">
      <View className="flex flex-row items-center justify-between">
        <Text size="xs" muted className="tracking-[4px]">
          PANELUI / ASSISTANT
        </Text>
        <ThemeControl />
      </View>
      <View className="flex flex-row items-center gap-[20px]">
        <Button
          size="icon"
          variant="outline"
          accessibilityLabel="Open conversations"
          onPress={onHistory}
        >
          <MenuIcon size={20} />
        </Button>
        <View className="min-w-0 flex-1">
          <Text className="block truncate text-center font-semibold">
            {title}
          </Text>
        </View>
        <Button
          size="icon"
          variant="outline"
          accessibilityLabel="New conversation"
          onPress={onNew}
        >
          <PlusIcon size={20} />
        </Button>
      </View>
    </View>
  );
};
