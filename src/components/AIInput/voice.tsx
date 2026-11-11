import { View } from "@tarojs/components";
import { useMemo } from "react";

import { MicIcon, XIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { Soundwave } from "../Soundwave";
import { CONTROL } from "./constants";
import { AIInputContext } from "./context";
import type { AIInputContextValue } from "./context";
import { Glass, hasNativeUI, useAIInputToken, useInputInsets } from "./surface";
import type { AIInputVoiceModeProps } from "./types";

export const AIInputVoiceMode = ({
  className,
  children,
  state = "listening",
  level,
  title,
  onMicPress,
  micLabel = "Mute",
  onClose,
  closeLabel = "End voice mode",
  size = "md",
  native = false,
  ...props
}: AIInputVoiceModeProps) => {
  const insets = useInputInsets();
  const onSolid = useAIInputToken("--color-background");
  const control = CONTROL[size] + 4;
  const context = useMemo<AIInputContextValue>(
    () => ({
      canStop: false,
      canVoice: false,
      disabled: false,
      focused: false,
      level,
      maxRows: 5,
      minRows: 1,
      native: native && hasNativeUI(),
      recordCancel: () => false,
      recordConfirm: () => false,
      setFocused: () => false,
      setValue: () => false,
      size,
      status: "ready",
      stop: () => false,
      submit: () => false,
      value: "",
      voice: () => false,
    }),
    [level, native, size]
  );
  return (
    <AIInputContext.Provider value={context}>
      <View
        {...props}
        className={cn(
          "flex flex-1 flex-col bg-[var(--panel-background)]",
          className
        )}
      >
        <Soundwave
          variant="ambient"
          state={state}
          level={level}
          aria-hidden
          className="absolute inset-[0px]"
        />

        <View className="flex flex-1 flex-col items-center justify-center gap-[64px] px-[48px]">
          {typeof title === "string" ? (
            <Text size="xl" className="text-center">
              {title}
            </Text>
          ) : (
            title
          )}

          <View className="flex flex-col items-center gap-[40px]">
            <Soundwave
              variant="pills"
              state={state}
              level={level}
              height={28}
            />
            <Glass
              variant="clear"
              radius={44}
              fallbackClassName="border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted)]"
              style={{ height: "176rpx", width: "176rpx" }}
            >
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={micLabel}
                onPress={onMicPress}
                className="flex h-full w-full flex-col items-center justify-center"
              >
                <MicIcon size={32} />
              </AnimatedPressable>
            </Glass>
          </View>
        </View>

        <View
          className="flex flex-row items-center gap-[24px] px-[40px]"
          style={{ paddingBottom: `${Math.max(insets.bottom, 20) * 2}rpx` }}
        >
          {children}
          <View className="flex flex-1 flex-col" />
          {
            <View
              className="overflow-hidden rounded-full bg-[var(--panel-foreground)]"
              style={{
                height: `${control * 2}rpx`,
                width: `${control * 2}rpx`,
              }}
            >
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel={closeLabel}
                onPress={onClose}
                className="flex h-full w-full flex-col items-center justify-center"
              >
                <XIcon
                  size={18}
                  color={typeof onSolid === "string" ? onSolid : undefined}
                />
              </AnimatedPressable>
            </View>
          }
        </View>
      </View>
    </AIInputContext.Provider>
  );
};
