import { View } from "@tarojs/components";
import { createInnerAudioContext, useDidHide } from "@tarojs/taro";
import { AIInput } from "panelui-taro/ai-input";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Slider } from "panelui-taro/slider";
import { useEffect, useRef, useState } from "react";

import { synthesize, transcribe } from "../../services/audio";
import { createRecorder } from "../../services/recorder";
import type { Recording } from "../../services/recorder";
export const ConnectedVoice = ({
  onClose,
  onTranscript,
  answer,
}: {
  onClose: () => void;
  onTranscript: (text: string) => void;
  answer: string;
}) => {
  const [phase, setPhase] = useState<
    "idle" | "starting" | "recording" | "working" | "speaking"
  >("idle");
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState("");
  const [manualLevel, setManualLevel] = useState(0);
  const recorder = useRef<ReturnType<typeof createRecorder> | null>(null);
  const player = useRef<ReturnType<typeof createInnerAudioContext> | null>(
    null
  );
  const cancel = useRef<(() => void) | null>(null);
  const alive = useRef(true);
  const releasePlayer = () => {
    const previousPlayer = player.current;
    player.current = null;
    previousPlayer?.destroy();
  };
  const reset = () => {
    recorder.current?.dispose();
    recorder.current = null;
    releasePlayer();
    cancel.current?.();
    cancel.current = null;
  };
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      reset();
    };
  }, []);
  useDidHide(() => {
    reset();
    setPhase("idle");
  });
  const play = (path: string) => {
    releasePlayer();
    const audio = createInnerAudioContext();
    player.current = audio;
    audio.onEnded(() => {
      if (alive.current && player.current === audio) {
        releasePlayer();
        setPhase("idle");
      }
    });
    audio.onError(() => {
      if (alive.current && player.current === audio) {
        releasePlayer();
        setError("Audio playback failed");
        setPhase("idle");
      }
    });
    audio.src = path;
    audio.play();
    setPhase("speaking");
  };
  const start = () => {
    releasePlayer();
    setError("");
    setRecording(null);
    setPhase("starting");
    recorder.current?.dispose();
    recorder.current = createRecorder({
      start: () => {
        if (alive.current) setPhase("recording");
      },
      stop: (note) => {
        if (alive.current) {
          setRecording(note);
          setPhase("idle");
        }
      },
      error: (message) => {
        if (alive.current) {
          setError(message);
          setPhase("idle");
        }
      },
    });
    void recorder.current.start();
  };
  const recognize = () => {
    if (!recording) return;
    setError("");
    setPhase("working");
    cancel.current?.();
    cancel.current = transcribe(
      recording.path,
      (text) => {
        if (alive.current) {
          onTranscript(text);
          onClose();
        }
      },
      (message) => {
        if (alive.current) {
          setError(message);
          setPhase("idle");
        }
      }
    );
  };
  const speak = () => {
    setError("");
    setPhase("working");
    cancel.current?.();
    cancel.current = synthesize(
      answer,
      (path) => {
        if (alive.current) play(path);
      },
      (message) => {
        if (alive.current) {
          setError(message);
          setPhase("idle");
        }
      }
    );
  };
  const idle = phase === "idle";
  return (
    <View className="relative flex h-full min-h-0 flex-1 flex-col">
      <AIInput.VoiceMode
        state={
          phase === "recording"
            ? "listening"
            : phase === "speaking"
              ? "speaking"
              : phase === "working"
                ? "thinking"
                : "idle"
        }
        level={manualLevel}
        title={
          phase === "recording"
            ? "Recording…"
            : phase === "working"
              ? "Processing audio…"
              : "Voice notes"
        }
        micLabel={phase === "recording" ? "Stop recording" : "Start recording"}
        onMicPress={() => {
          if (phase === "recording") recorder.current?.stop();
          else if (idle) start();
        }}
        onClose={onClose}
      >
        <AIInput.Pill label="Microphone" detail="Real recording" />
      </AIInput.VoiceMode>
      <View className="absolute inset-x-[32px] top-[24px] flex flex-col gap-[16px]">
        <Text size="xs" className="block" muted>
          Real microphone · Up to 60 seconds. Wave level is the manual preview
          below, not measured microphone volume.
        </Text>
        <Slider
          label="Preview wave level"
          min={0}
          max={1}
          step={0.05}
          value={manualLevel}
          onValueChange={setManualLevel}
        />
        {recording ? (
          <View className="flex flex-row items-center gap-[12px]">
            <Text size="xs">{recording.seconds.toFixed(1)}s voice note</Text>
            <Button
              size="sm"
              variant="outline"
              disabled={!idle}
              onPress={() => play(recording.path)}
            >
              Play recording
            </Button>
            <Button size="sm" disabled={!idle} onPress={recognize}>
              Use transcript
            </Button>
          </View>
        ) : null}
        {answer ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!idle || answer.length > 4000}
            onPress={speak}
          >
            Read last answer · AI voice
          </Button>
        ) : null}
        {phase === "speaking" || phase === "working" || phase === "starting" ? (
          <Button
            size="sm"
            variant="ghost"
            onPress={() => {
              reset();
              setPhase("idle");
            }}
          >
            Cancel audio
          </Button>
        ) : null}
        {error ? (
          <Text
            role="alert"
            className="block text-[var(--panel-destructive-foreground)]"
          >
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
