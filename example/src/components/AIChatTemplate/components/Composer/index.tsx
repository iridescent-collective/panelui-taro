import { View } from "@tarojs/components";
import { AIInput } from "panelui-taro/ai-input";
import { Button } from "panelui-taro/button";
import { PlusIcon, MicIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";

import type { ChatSession } from "../../type";

export const ChatComposer = ({
  session,
  mode = "demo",
  busy,
  onChange,
  onSubmit,
  onStop,
  onOptions,
  onVoice,
  onAttachment,
}: {
  session: ChatSession;
  mode?: "demo" | "live";
  busy: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onStop: () => void;
  onOptions: () => void;
  onVoice: () => void;
  onAttachment: () => void;
}) => (
  <View className="shrink-0 border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] px-[24px] pt-[20px] pb-[max(20px,env(safe-area-inset-bottom))]">
    {session.attachment ? (
      <View className="mb-[16px] flex flex-row items-center justify-between">
        <Text size="xs">Sample brief.txt · Included example</Text>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onPress={onAttachment}
        >
          Remove
        </Button>
      </View>
    ) : null}
    <AIInput
      value={session.draft}
      onValueChange={onChange}
      status={busy ? "streaming" : "ready"}
      onSubmit={onSubmit}
      onStop={onStop}
      onVoice={onVoice}
      avoidKeyboard
      keyboardGap={8}
      maxRows={4}
    >
      <AIInput.Field placeholder="Ask anything…" />
      <AIInput.Toolbar>
        <AIInput.Action
          label="Add sample brief"
          icon={<PlusIcon size={18} />}
          disabled={busy}
          onPress={onAttachment}
        />
        <AIInput.Pill
          label={mode === "live" ? "Connected service" : session.model}
          detail={mode === "live" ? "Live" : "Demo"}
          disabled={busy}
          onPress={onOptions}
        />
        <AIInput.Spacer />
        <AIInput.Action
          label="Open voice preview"
          icon={<MicIcon size={18} />}
          disabled={busy}
          onPress={onVoice}
        />
        <AIInput.Submit
          sendLabel="Send message"
          stopLabel="Stop response"
          voiceLabel="Open voice preview"
        />
      </AIInput.Toolbar>
    </AIInput>
    <Text className="mt-[12px] block text-center" size="xs" muted>
      {mode === "live"
        ? "Connected service · Generated responses may contain mistakes"
        : "Local demo · Responses are prepared examples"}
    </Text>
  </View>
);
