import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { CheckIcon, IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { useProgressButtonContext } from "./context";
import type {
  ProgressButtonLabelProps,
  ProgressButtonDoneProps,
  ProgressButtonVariant,
} from "./types";

const DONE_TINT: Record<ProgressButtonVariant, ThemeToken> = {
  destructive: "destructive-solid-foreground",
  primary: "primary-foreground",
  secondary: "background",
  success: "success-solid-foreground",
};
export const ProgressButtonLabel = ({
  className,
  children,
  ...props
}: ProgressButtonLabelProps) => {
  const { progress, width, slots } = useProgressButtonContext(
    "ProgressButton.Label"
  );
  const value = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  return (
    <View
      {...props}
      className={cn("relative flex", slots.content({ className }))}
    >
      {textChildren(children, (text) => (
        <Text className={slots.label()}>{text}</Text>
      ))}
      <View
        aria-hidden
        style={{
          bottom: 0,
          left: 0,
          overflow: "hidden",
          pointerEvents: "none",
          position: "absolute",
          top: 0,
          width: `${width * value * 2}rpx`,
        }}
        className={slots.fill()}
      >
        <View
          style={{ width: `${width * 2}rpx` }}
          className={cn("flex", slots.content())}
        >
          {textChildren(children, (text) => (
            <Text className={slots.fillLabel()}>{text}</Text>
          ))}
        </View>
      </View>
    </View>
  );
};
export const ProgressButtonDone = ({
  className,
  children,
  style: _style,
  ...props
}: ProgressButtonDoneProps) => {
  const { done, completed, variant, slots } = useProgressButtonContext(
    "ProgressButton.Done"
  );
  const value = useSyncExternalStore(
    done.subscribe,
    done.getSnapshot,
    done.getSnapshot
  );
  const tint = useThemeToken(DONE_TINT[variant]);
  return (
    <View
      {...props}
      aria-hidden={!completed}
      className={cn("flex", slots.fill(), slots.content({ className }))}
      style={{
        bottom: 0,
        left: 0,
        opacity: value,
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
      }}
    >
      <View
        className={cn("flex", slots.content())}
        style={{ transform: `scale(${0.7 + value * 0.3})` }}
      >
        <IconColorProvider color={tint}>
          {children ?? <CheckIcon size={18} />}
        </IconColorProvider>
      </View>
    </View>
  );
};
ProgressButtonLabel.displayName = "ProgressButton.Label";
ProgressButtonDone.displayName = "ProgressButton.Done";
