import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Slider } from "panelui-taro/slider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSharedValue } from "../runtime/motion";
import { View } from "../runtime/native";

export const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
interface RecordedNote {
  levels: number[];
  seconds: number;
  uri?: string;
}
export const useVoiceRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [note, setNote] = useState<RecordedNote>();
  const [input, setInput] = useState(0.5);
  const level = useSharedValue(0);
  const samples = useRef<number[]>([]);
  useEffect(() => {
    if (!recording) {
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const time = (Date.now() - start) / 1000;
      setSeconds(time);
      level.value = Math.max(
        0,
        Math.min(
          1,
          input * (0.6 + Math.sin(time * 5) * 0.25 + Math.sin(time * 11) * 0.15)
        )
      );
      samples.current.push(level.value);
    }, 80);
    return () => clearInterval(timer);
  }, [recording, input, level]);
  const toggle = useCallback(() => {
    if (recording) {
      setNote({ levels: samples.current.slice(-40), seconds });
      setRecording(false);
      level.value = 0;
    } else {
      samples.current = [];
      setSeconds(0);
      setRecording(true);
    }
  }, [recording, seconds, level]);
  const cancel = useCallback(() => {
    setRecording(false);
    setSeconds(0);
    level.value = 0;
  }, [level]);
  const clearNote = useCallback(() => setNote(undefined), []);
  return useMemo(
    () => ({
      cancel,
      clearNote,
      input,
      level,
      meter: null,
      note,
      reason: "Demo signal · Microphone is not recording",
      recording,
      seconds,
      setInput,
      toggle,
    }),
    [recording, seconds, note, level, input, toggle, cancel, clearNote]
  );
};
export const VoiceControls = ({
  voice,
  compact,
}: {
  voice: ReturnType<typeof useVoiceRecorder>;
  compact?: boolean;
}) => (
  <View className="gap-3 px-5">
    <Button variant="outline" onPress={voice.toggle}>
      {voice.recording ? "Stop preview" : "Preview signal"}
    </Button>
    {compact ? null : (
      <Slider
        value={voice.input}
        min={0}
        max={1}
        step={0.05}
        onValueChange={voice.setInput}
      />
    )}
    <Text size="xs" muted className="text-center">
      {voice.reason}
    </Text>
  </View>
);
