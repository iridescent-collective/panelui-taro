import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";

export const PauseControl = ({
  paused,
  pauseLabel,
  playLabel,
  onToggle,
}: {
  paused: boolean;
  pauseLabel: string;
  playLabel: string;
  onToggle: () => void;
}) => (
  <AnimatedPressable
    accessibilityRole="button"
    accessibilityLabel={paused ? playLabel : pauseLabel}
    className="flex min-h-[96px] items-center justify-center self-end rounded-full border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] px-[32px]"
    onClick={onToggle}
  >
    <Text className="text-[24px] leading-[1.333333] font-medium">
      {paused ? playLabel : pauseLabel}
    </Text>
  </AnimatedPressable>
);
