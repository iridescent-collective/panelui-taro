import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { ThinkingOrb } from "panelui-taro/thinking-orb";

import { SUGGESTIONS } from "../../constant";

export const ChatWelcome = ({
  onChoose,
  mode = "demo",
}: {
  onChoose: (prompt: string) => void;
  mode?: "demo" | "live";
}) => (
  <View className="flex flex-col gap-[28px] px-[16px] py-[24px]">
    <View className="flex flex-col items-center gap-[24px]">
      <ThinkingOrb state="composing" size={64} />
      <Text className="block text-center text-[52px] leading-[1.15] font-semibold tracking-[-1px]">
        A little help. A lot of possibility.
      </Text>
      <Text muted size="sm" className="block text-center">
        Think it through, make a plan, or build something new.
      </Text>
    </View>
    <View className="flex flex-col gap-[16px]">
      {SUGGESTIONS.map((item) => (
        <View
          key={item.kind}
          className="rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[16px]"
        >
          <Button
            fullWidth
            variant="ghost"
            onPress={() => onChoose(item.prompt)}
          >
            {item.title}
          </Button>
          <Text className="block text-center" size="xs" muted>
            {item.detail}
          </Text>
        </View>
      ))}
    </View>
    <Text className="block text-center" size="xs" muted>
      {mode === "live"
        ? "Connected service · Try asking for PanelUI documentation to exercise the tool"
        : "Interactive demo · Prepared responses · No model connected"}
    </Text>
  </View>
);
