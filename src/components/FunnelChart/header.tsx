import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import type { FunnelChartHeaderProps } from "./types";

export const FunnelChartHeader = ({
  className,
  title,
  value,
  caption,
  children,
  ...props
}: FunnelChartHeaderProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-row items-start justify-between gap-[24px] pb-[24px]",
      className
    )}
  >
    <View className="flex flex-1 flex-col gap-[4px]">
      {title ? (
        <Text size="xs" muted>
          {title}
        </Text>
      ) : null}
      {value ? (
        <Text size="xl" weight="bold">
          {value}
        </Text>
      ) : null}
      {caption ? (
        <Text size="xs" muted>
          {caption}
        </Text>
      ) : null}
    </View>
    {children ? (
      <View className="max-w-[55%] shrink pt-[8px]">{children}</View>
    ) : null}
  </View>
);

FunnelChartHeader.displayName = "FunnelChart.Header";
FunnelChartHeader.slot = "header" as const;
