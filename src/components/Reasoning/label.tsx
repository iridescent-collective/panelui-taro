import { Text, textChildren } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { useReasoning } from "./context";
import type { ReasoningTriggerProps } from "./types";
import { reasoningVariants } from "./variants";

const durationLabel = (duration?: number) =>
  duration === undefined
    ? "Thought for a few seconds"
    : `Thought for ${duration} ${duration === 1 ? "second" : "seconds"}`;
export const ReasoningLabel = ({
  label,
}: Pick<ReasoningTriggerProps, "label">) => {
  const { isStreaming, duration } = useReasoning("Reasoning.Trigger");
  const labelClass = reasoningVariants().label();
  if (label) {
    return (
      <>
        {textChildren(label(isStreaming, duration), (value) => (
          <Text className={labelClass}>{value}</Text>
        ))}
      </>
    );
  }
  if (isStreaming) {
    return <Shimmer textClassName={labelClass}>Thinking…</Shimmer>;
  }
  return <Text className={labelClass}>{durationLabel(duration)}</Text>;
};
