import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import {
  ChevronLeftIcon,
  MicIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  SunIcon,
  XIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import { Text } from "panelui-taro/primitives/text";
import { Soundwave } from "panelui-taro/soundwave";
import { useThemeMode } from "panelui-taro/theme";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useEffect, useState } from "react";

import { formatClock, useVoiceRecorder, VoiceControls } from "../extras/voice";
import { useAudioPlayer, useAudioPlayerStatus } from "../runtime/audio";
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "../runtime/motion";
import { useSafeAreaInsets } from "../runtime/native";
import { Pressable, ScrollView, View } from "../runtime/native";
import { router } from "../runtime/router";
import { ComponentEntry } from "../types";
const WAVE_STATES = ["idle", "listening", "thinking", "speaking"] as const;
function SoundwavePillsVersion() {
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 justify-between pt-6"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 items-center justify-center gap-8">
        <Soundwave
          variant="pills"
          state={voice.recording ? "listening" : "idle"}
          level={voice.recording ? voice.level : undefined}
          height={120}
          barWidth={34}
          barGap={12}
        />
        <Text muted>
          {voice.recording ? "Listening" : "Press record to start"}
        </Text>
      </View>

      <VoiceControls voice={voice} />
    </View>
  );
}
function SoundwaveBarsVersion() {
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerClassName="gap-6 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-3 px-5">
        <Text size="sm" muted>
          static — every bar is a band of the current level
        </Text>
        <Card>
          <Card.Content className="p-4">
            <Soundwave
              variant="bars"
              mode="static"
              state={voice.recording ? "listening" : "idle"}
              level={voice.recording ? voice.level : undefined}
              height={64}
            />
          </Card.Content>
        </Card>
      </View>

      <View className="gap-3 px-5">
        <Text size="sm" muted>
          scrolling — history slides left, newest on the right
        </Text>
        <Card>
          <Card.Content className="p-4">
            <Soundwave
              variant="bars"
              mode="scrolling"
              state={voice.recording ? "listening" : "idle"}
              level={voice.recording ? voice.level : undefined}
              height={64}
            />
          </Card.Content>
        </Card>
      </View>

      <View className="gap-3 px-5">
        <Text size="sm" muted>
          not centered, and thicker — a recording row
        </Text>
        <Card>
          <Card.Content className="flex-row items-center gap-3 p-4">
            <MicIcon size={18} />
            <View className="flex-1">
              <Soundwave
                variant="bars"
                mode="scrolling"
                centered={false}
                bars={28}
                barWidth={5}
                height={40}
                state={voice.recording ? "listening" : "idle"}
                level={voice.recording ? voice.level : undefined}
              />
            </View>
            <Text size="sm" muted>
              {formatClock(voice.seconds)}
            </Text>
          </Card.Content>
        </Card>
      </View>

      <VoiceControls voice={voice} compact />
    </ScrollView>
  );
}
function SoundwaveLineVersion() {
  const [state, setState] = useState<string[]>(["speaking"]);
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  const picked = WAVE_STATES.find((name) => name === state[0]) ?? "speaking";
  const current = voice.recording ? "listening" : picked;
  return (
    <ScrollView
      contentContainerClassName="gap-6 py-6"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="px-5">
        <Card>
          <Card.Content className="p-4">
            <Soundwave
              variant="line"
              state={current}
              level={voice.recording ? voice.level : undefined}
              height={96}
            />
          </Card.Content>
        </Card>
      </View>

      <View className="gap-3 px-5">
        <Text size="sm" muted>
          state — what it animates with no level supplied
        </Text>
        <ToggleButtonGroup
          selectionMode="single"
          value={state}
          onValueChange={setState}
        >
          {WAVE_STATES.map((name) => (
            <ToggleButton key={name} id={name}>
              {name}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </View>

      <View className="gap-3 px-5">
        <Text size="sm" muted>
          Under a reply, at the size it would sit there
        </Text>
        <Message>
          <Message.Avatar>
            <Avatar size="sm" fallback="AI" />
          </Message.Avatar>
          <Message.Content>
            <Message.Bubble>
              <View className="w-full gap-2">
                <Text size="sm">Here is what I found in the changelog.</Text>
                <Soundwave
                  variant="line"
                  state="speaking"
                  height={36}
                  barWidth={2}
                />
              </View>
            </Message.Bubble>
          </Message.Content>
        </Message>
      </View>

      <VoiceControls voice={voice} compact />
    </ScrollView>
  );
}
function SoundwaveAmbientVersion() {
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  const { mode, toggleMode } = useThemeMode();
  return (
    <View className="bg-background flex-1">
      <Soundwave
        variant="ambient"
        state={voice.recording ? "listening" : "idle"}
        level={voice.recording ? voice.level : undefined}
        radius={40}
      />

      <View
        className="flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 8 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onPress={() => router.back()}
          accessibilityLabel="Back"
        >
          <ChevronLeftIcon size={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full"
          onPress={toggleMode}
          accessibilityLabel={
            mode === "dark" ? "Switch to light" : "Switch to dark"
          }
        >
          {mode === "dark" ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </Button>
      </View>

      <View className="flex-1 items-center justify-center gap-3">
        <Text size="xl" weight="medium">
          {voice.recording ? "Listening" : "Start chatting anytime"}
        </Text>
        <Text size="sm" muted>
          The room is lit by the level, not by a spinner.
        </Text>
      </View>

      <View style={{ paddingBottom: insets.bottom + 24 }}>
        <VoiceControls voice={voice} />
      </View>
    </View>
  );
}
interface VoiceNote {
  id: string;
  align: "start" | "end";
  levels: number[];
  seconds: number;
  time: string;
  uri: string;
}
function seedWaveform(seed: number, bars = 40): number[] {
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  return Array.from({ length: bars }, (_unused, index) => {
    const envelope =
      0.45 + 0.55 * Math.sin((index / bars) * Math.PI * 2.2 + seed);
    return Math.max(0.08, Math.min(1, envelope * (0.5 + 0.7 * random())));
  });
}
const SEED_NOTES: VoiceNote[] = [
  {
    id: "n1",
    align: "start",
    levels: seedWaveform(3),
    seconds: 8,
    time: "09:41",
    uri: "",
  },
  {
    id: "n2",
    align: "end",
    levels: seedWaveform(11),
    seconds: 4,
    time: "09:42",
    uri: "",
  },
  {
    id: "n3",
    align: "start",
    levels: seedWaveform(27),
    seconds: 12,
    time: "09:44",
    uri: "",
  },
];
function NoteButton({
  playing,
  onPress,
}: {
  playing: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={playing ? "Pause" : "Play"}
      onPress={onPress}
      className="size-9 items-center justify-center rounded-full"
    >
      {playing ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
    </Pressable>
  );
}
function VoiceNoteBubble({ note }: { note: VoiceNote }) {
  const player = useAudioPlayer(note.uri || null);
  const status = useAudioPlayerStatus(player);
  const progress = useSharedValue(0);
  const [playingSeed, setPlayingSeed] = useState(false);
  useEffect(() => {
    if (!note.uri) return;
    progress.value = status.duration
      ? Math.min(1, status.currentTime / status.duration)
      : 0;
  }, [note.uri, status.currentTime, status.duration, progress]);
  const playing = note.uri ? status.playing : playingSeed;
  const toggle = () => {
    if (note.uri) {
      if (status.playing) player.pause();
      else {
        if (status.didJustFinish || status.currentTime >= status.duration)
          player.seek(0);
        player.play();
      }
      return;
    }
    if (playingSeed) {
      cancelAnimation(progress);
      setPlayingSeed(false);
      return;
    }
    setPlayingSeed(true);
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: note.seconds * 1000, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(setPlayingSeed)(false);
      }
    );
  };
  return (
    <Message align={note.align}>
      <Message.Content>
        <Message.Bubble className="px-3 py-2.5">
          <View className="w-64 flex-row items-center gap-3">
            <NoteButton playing={playing} onPress={toggle} />

            <View className="flex-1">
              <Soundwave
                variant="bars"
                levels={note.levels}
                progress={progress}
                bars={40}
                barWidth={2}
                height={28}
              />
            </View>

            <Text size="xs" muted>
              {formatClock(note.seconds)}
            </Text>
          </View>
        </Message.Bubble>
        <Message.Footer>{note.time}</Message.Footer>
      </Message.Content>
    </Message>
  );
}
function SoundwaveNotesVersion() {
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<VoiceNote[]>(SEED_NOTES);
  useEffect(() => {
    if (!voice.note) return;
    setNotes((current) => [
      ...current,
      {
        id: `rec-${current.length}`,
        align: "end",
        levels: voice.note!.levels,
        seconds: voice.note!.seconds,
        time: "now",
        uri: voice.note!.uri ?? "",
      },
    ]);
    voice.clearNote();
  }, [voice]);
  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="gap-3 px-4 py-4">
        {notes.map((note) => (
          <VoiceNoteBubble key={note.id} note={note} />
        ))}
      </ScrollView>

      <View
        className="border-border border-t pt-5"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <VoiceControls voice={voice} compact />
      </View>
    </View>
  );
}
function SoundwaveComposerVersion() {
  const voice = useVoiceRecorder();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<VoiceNote[]>(SEED_NOTES.slice(0, 2));
  useEffect(() => {
    if (!voice.note) return;
    setNotes((current) => [
      ...current,
      {
        id: `rec-${current.length}`,
        align: "end",
        levels: voice.note!.levels,
        seconds: voice.note!.seconds,
        time: "now",
        uri: voice.note!.uri ?? "",
      },
    ]);
    voice.clearNote();
  }, [voice]);
  return (
    <View className="flex-1">
      {voice.meter}

      <MessageScroller autoScroll className="flex-1">
        <MessageScroller.Viewport>
          <MessageScroller.Content className="gap-3 px-4 py-4">
            {notes.map((note) => (
              <MessageScroller.Item key={note.id} messageId={note.id}>
                <VoiceNoteBubble note={note} />
              </MessageScroller.Item>
            ))}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button />
      </MessageScroller>

      <View
        className="border-border border-t p-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {voice.recording ? (
          <View className="flex-row items-center gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel recording"
              onPress={voice.cancel}
              className="size-10 items-center justify-center rounded-full"
            >
              <XIcon size={18} />
            </Pressable>

            <View className="flex-1">
              <Soundwave
                variant="bars"
                mode="scrolling"
                level={voice.level}
                bars={32}
                barWidth={3}
                height={36}
              />
            </View>

            <Text size="sm" muted>
              {formatClock(voice.seconds)}
            </Text>

            <Button
              size="icon"
              className="size-10 rounded-full"
              onPress={voice.toggle}
            >
              <SendIcon size={16} />
            </Button>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <View className="bg-muted flex-1 rounded-full px-4 py-2.5">
              <Text size="sm" muted>
                Hold the mic, or press it
              </Text>
            </View>
            <Button
              size="icon"
              className="size-10 rounded-full"
              onPress={voice.toggle}
            >
              <MicIcon size={18} />
            </Button>
          </View>
        )}

        {voice.reason ? (
          <Text size="xs" muted className="pt-3 text-center">
            {voice.reason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "soundwave",
  name: "Soundwave",
  summary: "What a voice looks like while an app listens",
  demos: [
    {
      label: "Capsules",
      id: "pills",
      fullPage: true,
      description: "The few big capsules over a microphone button.",
      render: () => <SoundwavePillsVersion />,
    },
    {
      label: "Metering bars",
      id: "bars",
      fullPage: true,
      description: "Static bands and a scrolling history, in a transcript.",
      render: () => <SoundwaveBarsVersion />,
    },
    {
      label: "Travelling wave",
      id: "line",
      fullPage: true,
      description: "One ribbon, and what each state does to it.",
      render: () => <SoundwaveLineVersion />,
    },
    {
      label: "Ambient glow",
      id: "ambient",
      fullPage: true,
      fullBleed: true,
      description: "A bloom off the bottom edge and a rim around the screen.",
      render: () => <SoundwaveAmbientVersion />,
    },
    {
      label: "Colour",
      render: () => (
        <View className="w-full gap-5">
          <View className="gap-2">
            <Text size="sm" muted>
              a theme token, so it follows the theme into dark mode
            </Text>
            <Soundwave variant="bars" color="--color-info" height={48} />
          </View>
          <View className="gap-2">
            <Text size="sm" muted>
              a colour of your own
            </Text>
            <Soundwave variant="bars" color="#f97316" height={48} />
          </View>
          <View className="gap-2">
            <Text size="sm" muted>
              a gradient across the wave
            </Text>
            <Soundwave
              variant="line"
              gradient={["#6366f1", "#ec4899", "#f59e0b"]}
              height={64}
            />
          </View>
          <View className="gap-2">
            <Text size="sm" muted>
              a track colour, for the part not played yet
            </Text>
            <Soundwave
              variant="bars"
              levels={seedWaveform(5)}
              progress={0.45}
              color="--color-success"
              trackColor="--color-muted"
              height={48}
            />
          </View>
        </View>
      ),
    },
    {
      label: "Voice notes",
      id: "notes",
      fullPage: true,
      description: "Recorded waveforms in bubbles, filling as they play.",
      render: () => <SoundwaveNotesVersion />,
    },
    {
      label: "Recording composer",
      id: "composer",
      fullPage: true,
      description: "A composer that turns into a recorder over a transcript.",
      render: () => <SoundwaveComposerVersion />,
    },
  ],
};
