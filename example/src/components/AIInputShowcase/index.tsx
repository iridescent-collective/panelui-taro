import { View } from "@tarojs/components";
import { AIInput } from "panelui-taro/ai-input";
import { Button } from "panelui-taro/button";
import { PlusIcon, MicIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

export const AIInputShowcase = () => {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"ready" | "recording" | "streaming">(
    "ready"
  );
  const [open, setOpen] = useState(false);
  const [web, setWeb] = useState(false);
  const [model, setModel] = useState("Model A");
  const [voice, setVoice] = useState(false);
  const [inline, setInline] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [action, setAction] = useState("No action");
  const addControl = (
    <AIInput.Action
      label="Add"
      icon={<PlusIcon size={18} />}
      onPress={() => setOpen(true)}
    />
  );
  const recordControl = (
    <AIInput.Action
      label="Record"
      icon={<MicIcon size={18} />}
      onPress={() => setStatus("recording")}
    />
  );
  const modelControl = (
    <AIInput.Pill
      label={model}
      detail="High"
      disabled={disabled}
      onPress={() => setOpen(true)}
    />
  );
  const controls = (
    <>
      {addControl}
      {modelControl}
      <AIInput.Spacer />
      {recordControl}
      <AIInput.Submit />
    </>
  );
  return (
    <View className="flex flex-col gap-[24px]">
      {voice ? (
        <View className="relative h-[720px]">
          <AIInput.VoiceMode
            title="How can I help?"
            level={0.5}
            onMicPress={() => setAction("Microphone toggled")}
            onClose={() => setVoice(false)}
          >
            <AIInput.Pill label={model} />
          </AIInput.VoiceMode>
        </View>
      ) : (
        <AIInput
          value={value}
          onValueChange={setValue}
          status={status}
          disabled={disabled}
          level={0.5}
          onSubmit={(prompt) => {
            setAction(`Sent ${prompt}`);
            setStatus("streaming");
          }}
          onStop={() => setStatus("ready")}
          onVoice={() => setVoice(true)}
          onRecordCancel={() => setStatus("ready")}
          onRecordConfirm={() => {
            setValue("Recorded prompt");
            setStatus("ready");
          }}
        >
          {inline && status !== "recording" ? (
            <AIInput.Row>
              {addControl}
              <AIInput.Field placeholder="Ask anything" />
              {recordControl}
              <AIInput.Submit />
            </AIInput.Row>
          ) : (
            <>
              <AIInput.Field placeholder="Ask anything" />
              {status === "recording" ? (
                <AIInput.Recording />
              ) : (
                <AIInput.Toolbar>{controls}</AIInput.Toolbar>
              )}
            </>
          )}
        </AIInput>
      )}
      {inline && !voice && status !== "recording" ? (
        <View className="flex flex-row">{modelControl}</View>
      ) : null}
      <Text size="xs" className="break-all">
        {JSON.stringify({
          action,
          disabled,
          inline,
          model,
          status,
          value,
          web,
        })}
      </Text>
      <Button onPress={() => setInline(!inline)}>Toggle inline composer</Button>
      <Button onPress={() => setDisabled(!disabled)}>
        {disabled ? "Enable composer" : "Disable composer"}
      </Button>
      <AIInput.Sheet open={open} onOpenChange={setOpen}>
        <AIInput.Sheet.Screen id="root" title="Options">
          <AIInput.Sheet.Group>
            <AIInput.Sheet.Row label="Model" value={model} to="models" />
            <AIInput.Sheet.Toggle
              label="Web search"
              value={web}
              onValueChange={setWeb}
            />
          </AIInput.Sheet.Group>
        </AIInput.Sheet.Screen>
        <AIInput.Sheet.Screen id="models" title="Choose model">
          <AIInput.Sheet.Group>
            <AIInput.Sheet.Choice
              label="Model A"
              selected={model === "Model A"}
              onPress={() => setModel("Model A")}
            />
            <AIInput.Sheet.Choice
              label="Model B"
              selected={model === "Model B"}
              onPress={() => setModel("Model B")}
            />
          </AIInput.Sheet.Group>
        </AIInput.Sheet.Screen>
      </AIInput.Sheet>
    </View>
  );
};
