import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Avatar } from "../Avatar";
import { Text } from "../primitives/Text";

export const ProfileIdentity = ({
  name,
  avatar,
  accountLabel,
  variant = "surface",
  action,
}: {
  name: string;
  avatar?: string;
  accountLabel: string;
  variant?: "surface" | "plain";
  action?: ReactNode;
}) => (
  <View
    className={cn(
      "flex min-w-0 flex-row items-center gap-[24px]",
      variant === "surface" &&
        "rounded-[var(--panel-radius-2xl)] bg-[var(--panel-surface)] p-[28px]"
    )}
  >
    <Avatar
      source={avatar ? { uri: avatar } : undefined}
      fallback={name.trim().slice(0, 1) || "你"}
      size="lg"
    />
    <View className="flex min-w-0 flex-1 flex-col gap-[8px]">
      <Text
        weight="semibold"
        className={cn(
          "break-words",
          variant === "plain" && "text-[48px] leading-[1.25] tracking-[-1px]"
        )}
      >
        {name.trim() || "你的名字"}
      </Text>
      <Text size="sm" muted className="break-all">
        {accountLabel}
      </Text>
    </View>
    {action}
  </View>
);
