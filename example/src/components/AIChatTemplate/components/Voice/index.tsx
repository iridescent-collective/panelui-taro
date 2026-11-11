import { View } from "@tarojs/components";
import { AIInput } from "panelui-taro/ai-input";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { useEffect, useState } from "react";

const VOICE_STATES = ["idle", "listening", "thinking", "speaking"] as const;
export const SimulatedVoice = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step !== 1 && step !== 2) {
      return;
    }
    const timer = setTimeout(() => setStep((current) => current + 1), 1800);
    return () => clearTimeout(timer);
  }, [step]);
  return (
    <View className="relative flex h-full min-h-0 flex-1 flex-col">
      <AIInput.VoiceMode
        state={VOICE_STATES[step]}
        title={
          ["Let’s talk", "Listening…", "Thinking…", "Here’s a starting point"][
            step
          ]
        }
        level={step === 1 || step === 3 ? 0.5 : 0}
        micLabel={step ? "Pause voice preview" : "Start voice preview"}
        onMicPress={() => setStep(step ? 0 : 1)}
        onClose={onClose}
      >
        <AIInput.Pill label="Voice preview" detail="Simulated" />
      </AIInput.VoiceMode>
      <View className="absolute inset-x-[32px] top-[32px] flex flex-col gap-[20px]">
        <Text size="sm" className="block text-center" muted>
          Simulated voice · Microphone is not recording
        </Text>
        {step === 3 ? (
          <View className="rounded-[24px] bg-[var(--panel-card)] p-[28px]">
            <Text className="block">
              Start with one clear outcome. Then choose the smallest useful next
              step.
            </Text>
            <Button size="sm" variant="ghost" onPress={() => setStep(1)}>
              Play demo again
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );
};
