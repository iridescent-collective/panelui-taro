import { View } from "@tarojs/components";

import { Text } from "../primitives/Text";
import { Progress } from "../Progress";

export const SetupProgressHeader = ({
  step,
  steps,
  label,
  counter,
}: {
  step: number;
  steps: readonly string[];
  label?: string;
  counter?: string;
}) => (
  <View className="flex flex-col gap-[16px]">
    <View className="flex flex-row items-center justify-between gap-[16px]">
      <Text size="sm" weight="semibold">
        {steps[step]}
      </Text>
      <Text size="xs" muted>
        {counter ?? `${step + 1} / ${steps.length}`}
      </Text>
    </View>
    <Progress
      value={step + 1}
      maxValue={steps.length}
      size="sm"
      label={label}
      ariaLabel={label ?? steps[step]}
    />
  </View>
);
