import { chooseMedia, chooseMessageFile, showToast } from "@tarojs/taro";
import { AIInput, type AIInputStatus } from "panelui-taro/ai-input";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import {
  CameraIcon,
  ChevronsUpDownIcon,
  FileIcon,
  GlobeIcon,
  MicIcon,
  PlusIcon,
  SearchIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { useCallback, useState } from "react";

import { useSharedValue } from "../runtime/motion";
import { ScrollView, View } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import { router } from "../runtime/router";
import { ComponentEntry } from "../types";
const MODELS = ["Sonnet 4.6", "Opus 4.6"];

export function ComposerDemo({
  initial = "",
  placeholder = "Chat with the model",
  inline = false,
  initialStatus = "ready",
  initialSheet = false,
  keyboardBottomInset,
  onSend,
}: {
  initial?: string;
  placeholder?: string;
  inline?: boolean;
  initialStatus?: AIInputStatus;
  initialSheet?: boolean;
  keyboardBottomInset?: number;
  onSend?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<AIInputStatus>(initialStatus);
  const [sheet, setSheet] = useState(initialSheet);
  const [models, setModels] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const [voice, setVoice] = useState(false);
  const add = (
    <AIInput.Action
      label="Add to chat"
      icon={<PlusIcon size={17} />}
      onPress={() => setSheet(true)}
    />
  );
  const dictate = (
    <AIInput.Action
      label="Dictate"
      icon={<MicIcon size={15} />}
      onPress={() => setStatus("recording")}
    />
  );
  return (
    <>
      {!voice ? (
        <AIInput
          native
          value={value}
          onValueChange={setValue}
          status={status}
          avoidKeyboard={keyboardBottomInset !== undefined}
          keyboardBottomInset={keyboardBottomInset}
          keyboardGap={12}
          onSubmit={(prompt) => {
            onSend?.(prompt);
            setValue("");
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
              {add}
              <AIInput.Field placeholder={placeholder} />
              {dictate}
              <AIInput.Submit />
            </AIInput.Row>
          ) : (
            <>
              <AIInput.Field placeholder={placeholder} />
              {status === "recording" ? (
                <AIInput.Recording />
              ) : (
                <AIInput.Toolbar>
                  {add}
                  <AIInput.Pill
                    label={model}
                    accessibilityLabel="Change model"
                    onPress={() => setModels(true)}
                  />
                  <AIInput.Spacer />
                  {dictate}
                  <AIInput.Submit />
                </AIInput.Toolbar>
              )}
            </>
          )}
        </AIInput>
      ) : null}
      <BottomSheet open={voice} onOpenChange={setVoice}>
        <BottomSheet.Content
          size="full"
          detached={false}
          showClose={false}
          showGrabber={false}
          className="px-[0px] pt-[0px]"
          style={{ paddingBottom: 0 }}
        >
          <VoiceDemo onClose={() => setVoice(false)} />
        </BottomSheet.Content>
      </BottomSheet>
      {status === "recording" && !voice ? (
        <Text size="xs" muted>
          Recording demo · no microphone capture
        </Text>
      ) : null}
      <AddToChatSheet open={sheet} onOpenChange={setSheet} />
      <AIInput.Sheet open={models} onOpenChange={setModels}>
        <AIInput.Sheet.Screen id="models" title="Choose model">
          <AIInput.Sheet.Group>
            {MODELS.map((name) => (
              <AIInput.Sheet.Choice
                key={name}
                label={name}
                selected={model === name}
                onPress={() => {
                  setModel(name);
                  setModels(false);
                }}
              />
            ))}
          </AIInput.Sheet.Group>
        </AIInput.Sheet.Screen>
      </AIInput.Sheet>
    </>
  );
}
function InlineComposerDemo() {
  return <ComposerDemo inline placeholder="Ask anything" />;
}
function RecordingDemo() {
  return <ComposerDemo initialStatus="recording" />;
}
function StreamingDemo() {
  return (
    <ComposerDemo
      initialStatus="streaming"
      initial="Explain the difference between a bottom sheet and a drawer"
    />
  );
}
const TURNS = [
  { from: "them", text: "Good evening. What are we working on?" },
  { from: "me", text: "A composer for the library." },
  {
    from: "them",
    text: "Start with what happens when the text runs past one line — that is the part every composer gets wrong.",
  },
];
function ChatDemo() {
  const insets = useSafeAreaInsets();
  const [turns, setTurns] = useState(TURNS);
  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-4 pb-4 pt-6"
        keyboardDismissMode="interactive"
      >
        {turns.map((turn, index) => (
          <View
            key={index}
            className={
              turn.from === "me"
                ? "bg-primary max-w-[80%] self-end rounded-2xl px-3.5 py-2.5"
                : "bg-muted max-w-[85%] self-start rounded-2xl px-3.5 py-2.5"
            }
          >
            <Text
              className={
                turn.from === "me" ? "text-primary-foreground" : undefined
              }
            >
              {turn.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        className="px-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <ComposerDemo
          keyboardBottomInset={Math.max(insets.bottom, 12)}
          onSend={(text) =>
            setTurns((current) => [...current, { from: "me", text }])
          }
        />
      </View>
    </View>
  );
}
const TOOL_MODES = [
  { id: "auto", label: "Auto", description: "The model chooses for you" },
  {
    id: "on-demand",
    label: "On demand",
    description: "Load when needed. More messages, lower accuracy",
  },
  {
    id: "always",
    label: "Always available",
    description: "Ready from the start. Fewer messages, better accuracy",
  },
];
const PROJECTS = [
  { id: "library", name: "Component library", updated: "last week" },
  { id: "docs", name: "Documentation site", updated: "last month" },
];
function AddToChatSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [projects, setProjects] = useState(PROJECTS);
  const [attachment, setAttachment] = useState("");
  const selectAttachment = async (kind: "camera" | "album" | "file") => {
    try {
      const result =
        kind === "file"
          ? await chooseMessageFile({ count: 1, type: "file" })
          : await chooseMedia({
              count: 1,
              mediaType: ["image"],
              sourceType: [kind],
            });
      setAttachment(`${result.tempFiles.length} file selected · not uploaded`);
    } catch (error) {
      const message = (error as { errMsg?: string })?.errMsg ?? "";
      if (!message.includes("cancel")) {
        void showToast({ title: "Unable to select a file", icon: "none" });
      }
    }
  };
  const [project, setProject] = useState<string | null>(null);
  const [tools, setTools] = useState("auto");
  const [research, setResearch] = useState(false);
  const [web, setWeb] = useState(true);
  const toolLabel =
    TOOL_MODES.find((mode) => mode.id === tools)?.label ?? "Auto";
  const projectLabel =
    projects.find((entry) => entry.id === project)?.name ?? "None";
  return (
    <AIInput.Sheet open={open} onOpenChange={onOpenChange}>
      <AIInput.Sheet.Screen
        id="root"
        title="Add to chat"
        trailing={
          <Button
            variant="ghost"
            size="sm"
            onPress={() => void selectAttachment("album")}
          >
            All photos
          </Button>
        }
      >
        <AIInput.Sheet.Group footnote={attachment || undefined}>
          <AIInput.Sheet.Row
            icon={<CameraIcon size={20} />}
            label="Camera"
            onPress={() => void selectAttachment("camera")}
          />
          <AIInput.Sheet.Row
            icon={<FileIcon size={20} />}
            label="Add files"
            onPress={() => void selectAttachment("file")}
          />
        </AIInput.Sheet.Group>

        <AIInput.Sheet.Group>
          <AIInput.Sheet.Row
            label="Add to project"
            value={projectLabel}
            to="project"
          />
          <AIInput.Sheet.Row label="Tool access" value={toolLabel} to="tools" />
        </AIInput.Sheet.Group>

        <AIInput.Sheet.Group>
          <AIInput.Sheet.Toggle
            icon={<SearchIcon size={20} />}
            label="Research"
            value={research}
            onValueChange={setResearch}
          />
          <AIInput.Sheet.Toggle
            icon={<GlobeIcon size={20} />}
            label="Web search"
            value={web}
            onValueChange={setWeb}
          />
        </AIInput.Sheet.Group>
      </AIInput.Sheet.Screen>

      <AIInput.Sheet.Screen
        id="project"
        title="Add to project"
        trailing={
          <AIInput.Action
            label="New project"
            icon={<PlusIcon size={17} />}
            onPress={() => {
              const id = `demo-${projects.length + 1}`;
              setProjects((current) => [
                ...current,
                {
                  id,
                  name: `Demo project ${current.length + 1}`,
                  updated: "just now",
                },
              ]);
              setProject(id);
            }}
          />
        }
      >
        <AIInput.Sheet.Group>
          {projects.map((entry) => (
            <AIInput.Sheet.Row
              key={entry.id}
              label={entry.name}
              description={entry.updated}
              onPress={() => setProject(entry.id)}
              value={project === entry.id ? "Selected" : undefined}
            />
          ))}
        </AIInput.Sheet.Group>
      </AIInput.Sheet.Screen>

      <AIInput.Sheet.Screen id="tools" title="Tool access">
        <AIInput.Sheet.Group footnote="Tools the model can reach while it answers.">
          {TOOL_MODES.map((mode) => (
            <AIInput.Sheet.Choice
              key={mode.id}
              label={mode.label}
              description={mode.description}
              selected={tools === mode.id}
              onPress={() => setTools(mode.id)}
            />
          ))}
        </AIInput.Sheet.Group>
      </AIInput.Sheet.Screen>
    </AIInput.Sheet>
  );
}
function SheetDemo() {
  return (
    <View className="bg-background flex-1 items-center justify-center px-6">
      <View className="w-full max-w-sm">
        <ComposerDemo initialSheet />
      </View>
    </View>
  );
}
function VoiceDemo({
  onClose = () => router.back(),
}: {
  onClose?: () => void;
}) {
  const level = useSharedValue(0);
  const [muted, setMuted] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [models, setModels] = useState(false);
  const [model, setModel] = useState(MODELS[0]);
  const toggle = useCallback(() => setMuted((current) => !current), []);
  return (
    <>
      <AIInput.VoiceMode
        native
        state={muted ? "idle" : "listening"}
        level={level}
        title={muted ? "Muted" : "Start chatting anytime"}
        micLabel={muted ? "Unmute" : "Mute"}
        onMicPress={toggle}
        onClose={onClose}
      >
        <AIInput.Action
          label="Add to chat"
          icon={<PlusIcon size={17} />}
          onPress={() => setSheet(true)}
        />
        <AIInput.Pill
          label={model}
          indicator={<ChevronsUpDownIcon size={14} />}
          indicatorSymbol="chevron.up.chevron.down"
          accessibilityLabel="Change model"
          onPress={() => setModels(true)}
        />
      </AIInput.VoiceMode>
      <Text size="xs" muted>
        Voice demo · no microphone capture or model connection
      </Text>
      <AIInput.Sheet open={models} onOpenChange={setModels}>
        <AIInput.Sheet.Screen id="models" title="Choose model">
          <AIInput.Sheet.Group>
            {MODELS.map((name) => (
              <AIInput.Sheet.Choice
                key={name}
                label={name}
                selected={model === name}
                onPress={() => {
                  setModel(name);
                  setModels(false);
                }}
              />
            ))}
          </AIInput.Sheet.Group>
        </AIInput.Sheet.Screen>
      </AIInput.Sheet>
      <AddToChatSheet open={sheet} onOpenChange={setSheet} />
    </>
  );
}
export const entry: ComponentEntry = {
  slug: "ai-input",
  name: "aiInput",
  summary:
    "A prompt composer, the sheet it opens, and a screen with no field on it",
  demos: [
    { label: "At rest", render: () => <ComposerDemo /> },
    { label: "On one line", render: () => <InlineComposerDemo /> },
    {
      label: "Past one line",
      render: () => (
        <ComposerDemo initial="It grows a line at a time until it reaches five of them, and then it holds that height and starts to scroll instead, which is what keeps the row of buttons on the screen." />
      ),
    },
    { label: "While the answer arrives", render: () => <StreamingDemo /> },
    { label: "While recording", render: () => <RecordingDemo /> },
    {
      label: "In a chat",
      id: "chat",
      fullPage: true,
      description:
        "Docked above the keyboard, over a transcript that stays where it is.",
      render: () => <ChatDemo />,
    },
    {
      label: "The sheet it opens",
      id: "sheet",
      fullPage: true,
      description:
        "Three screens on one sheet, each row pushing the next onto it.",
      render: () => <SheetDemo />,
    },
    {
      label: "Voice mode",
      id: "voice",
      fullPage: true,
      fullBleed: true,
      description: "The screen with no field: one microphone, and a way out.",
      render: () => <VoiceDemo />,
    },
  ],
};
