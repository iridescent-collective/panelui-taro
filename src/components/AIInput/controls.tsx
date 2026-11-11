import { View } from "@tarojs/components";

import {
  AudioLinesIcon,
  CheckIcon,
  IconColorProvider,
  SendArrowIcon,
  XIcon,
} from "../../icons";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { Soundwave } from "../Soundwave";
import { CONTROL, NATIVE_ROW_HEIGHT, NATIVE_ROW_FOOT } from "./constants";
import {
  AIInputInlineContext,
  useAIInput,
  useAIInputOptional,
} from "./context";
import { Glass, useAIInputToken } from "./surface";
import type {
  AIInputRowProps,
  AIInputToolbarProps,
  AIInputActionProps,
  AIInputPillProps,
  AIInputSubmitProps,
  AIInputRecordingProps,
  AIInputViewProps,
} from "./types";
import { aiInputVariants } from "./variants";

export const submitMode = (
  status: string,
  value: string
): "stop" | "send" | "voice" => {
  if (status === "streaming" || status === "submitted") {
    return "stop";
  }
  return value.trim().length > 0 ? "send" : "voice";
};
const SubmitGlyph = ({ mode }: { mode: "stop" | "send" | "voice" }) => {
  if (mode === "send") {
    return <SendArrowIcon size={18} />;
  }
  if (mode === "stop") {
    return (
      <View
        className="rounded-[var(--panel-radius-sm)] bg-[var(--panel-primary-foreground)]"
        style={{ height: "22rpx", width: "22rpx" }}
      />
    );
  }
  return <AudioLinesIcon size={18} />;
};
export const AIInputRow = ({
  className,
  children,
  ...props
}: AIInputRowProps) => {
  const { size } = useAIInput("AIInput.Row");
  const slots = aiInputVariants({ size });
  return (
    <AIInputInlineContext.Provider value>
      <View {...props} className={slots.row({ className })}>
        {children}
      </View>
    </AIInputInlineContext.Provider>
  );
};
export const AIInputToolbar = ({
  className,
  children,
  style,
  ...props
}: AIInputToolbarProps) => {
  const { size, native } = useAIInput("AIInput.Toolbar");
  const slots = aiInputVariants({ size });
  return (
    <View
      {...props}
      role="toolbar"
      aria-role="toolbar"
      className={cn(
        slots.toolbar({ className }),
        native && "absolute inset-x-[0px] bottom-[0px]"
      )}
      style={mergeStyleAfter(
        style,
        native
          ? {
              height: `${NATIVE_ROW_HEIGHT * 2}rpx`,
              paddingBottom: `${NATIVE_ROW_FOOT * 2}rpx`,
            }
          : {}
      )}
    >
      {children}
    </View>
  );
};
export const AIInputSpacer = ({ className, ...props }: AIInputViewProps) => (
  <View {...props} className={cn("flex flex-1 flex-col", className)} />
);
export const AIInputAction = ({
  className,
  label,
  icon,
  onPress,
  onClick,
  disabled,
  size: sizeProp,
  native: _native,
  ...props
}: AIInputActionProps) => {
  const context = useAIInputOptional();
  const scale = sizeProp ?? context?.size ?? "md";
  const size = CONTROL[scale];
  const isDisabled = Boolean(disabled || context?.disabled);
  return (
    <Glass
      variant="clear"
      radius={size / 2}
      fallbackClassName="bg-[var(--panel-muted)]"
      {...props}
      className={className}
      style={{ height: `${size * 2}rpx`, width: `${size * 2}rpx` }}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.(event);
          onPress?.();
        }}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center",
          isDisabled && "opacity-40"
        )}
      >
        {icon}
      </AnimatedPressable>
    </Glass>
  );
};
export const AIInputPill = ({
  className,
  label,
  detail,
  indicator,
  indicatorSymbol: _indicatorSymbol,
  onPress,
  onClick,
  disabled,
  accessibilityLabel,
  size: sizeProp,
  native: _native,
  ...props
}: AIInputPillProps) => {
  const context = useAIInputOptional();
  const size = sizeProp ?? context?.size ?? "md";
  const height = CONTROL[size];
  const isDisabled = Boolean(disabled || context?.disabled);
  const slots = aiInputVariants({ size });
  return (
    <Glass
      variant="clear"
      radius={height / 2}
      fallbackClassName="bg-[var(--panel-muted)]"
      {...props}
      className={className}
      style={{ height: `${height * 2}rpx` }}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onClick={(event) => {
          event.stopPropagation();
          onClick?.(event);
          onPress?.();
        }}
        className={slots.pill({
          className: cn("h-full", isDisabled && "opacity-40"),
        })}
      >
        {typeof label === "string" ? (
          <Text size="sm" weight="medium">
            {label}
          </Text>
        ) : (
          label
        )}
        {typeof detail === "string" ? (
          <Text size="sm" muted>
            {detail}
          </Text>
        ) : (
          detail
        )}
        {indicator}
      </AnimatedPressable>
    </Glass>
  );
};
export const AIInputSubmit = ({
  className,
  sendLabel = "Send",
  voiceLabel = "Voice mode",
  stopLabel = "Stop",
  native: _native,
  ...props
}: AIInputSubmitProps) => {
  const context = useAIInput("AIInput.Submit");
  const {
    value,
    status,
    size,
    disabled,
    submit,
    stop,
    voice,
    canVoice,
    canStop,
  } = context;
  const diameter = CONTROL[size] + 2;
  const hasText = value.trim().length > 0;
  const onSurface = useAIInputToken("--color-primary-foreground");
  const onSolid = useAIInputToken("--color-background");
  const mode = submitMode(status, value);
  let label = voiceLabel;
  let onPress = voice;
  let inert = disabled || !canVoice;
  if (mode === "stop") {
    label = stopLabel;
    onPress = stop;
    inert = disabled || !canStop;
  } else if (mode === "send") {
    label = sendLabel;
    onPress = submit;
    inert = disabled || !hasText;
  }
  const glyph = <SubmitGlyph mode={mode} />;
  return (
    <View
      {...props}
      className={cn(
        "overflow-hidden rounded-full",
        mode === "voice"
          ? "bg-[var(--panel-foreground)]"
          : "bg-[var(--panel-primary)]",
        className
      )}
      style={{ height: `${diameter * 2}rpx`, width: `${diameter * 2}rpx` }}
    >
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: inert }}
        disabled={inert}
        onPress={onPress}
        className={cn(
          "flex h-full w-full flex-col items-center justify-center",
          inert && "opacity-40"
        )}
      >
        <IconColorProvider color={mode === "voice" ? onSolid : onSurface}>
          {glyph}
        </IconColorProvider>
      </AnimatedPressable>
    </View>
  );
};
export const AIInputRecording = ({
  className,
  cancelLabel = "Discard recording",
  confirmLabel = "Use recording",
  native: _native,
  ...props
}: AIInputRecordingProps) => {
  const context = useAIInput("AIInput.Recording");
  const {
    size,
    disabled,
    level,
    recordCancel,
    recordConfirm,
    native: _contextNative,
  } = context;
  const control = CONTROL[size];
  const slots = aiInputVariants({ size });
  const onPrimary = useAIInputToken("--color-primary-foreground");
  const meter = (
    <View className={slots.meter()}>
      <Soundwave
        variant="bars"
        mode="scrolling"
        state="listening"
        level={level}
        centered
        barWidth={2.5}
        height={control}
      />
    </View>
  );
  return (
    <View {...props} className={slots.recording({ className })}>
      <Glass
        variant="clear"
        radius={control / 2}
        fallbackClassName="bg-[var(--panel-muted)]"
        style={{ height: `${control * 2}rpx`, width: `${control * 2}rpx` }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          disabled={disabled}
          accessibilityState={{ disabled }}
          onPress={recordCancel}
          className="flex h-full w-full flex-col items-center justify-center"
        >
          <XIcon size={16} />
        </AnimatedPressable>
      </Glass>

      {meter}

      <View
        className="overflow-hidden rounded-full bg-[var(--panel-primary)]"
        style={{
          height: `${(control + 4) * 2}rpx`,
          width: `${(control + 4) * 2}rpx`,
        }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={confirmLabel}
          disabled={disabled}
          accessibilityState={{ disabled }}
          onPress={recordConfirm}
          className="flex h-full w-full flex-col items-center justify-center"
        >
          <CheckIcon
            size={18}
            color={typeof onPrimary === "string" ? onPrimary : undefined}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
};
