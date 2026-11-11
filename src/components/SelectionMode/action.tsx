import { IconColorProvider } from "../../icons/context";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { useSelectionMode } from "./context";
import type { SelectionModeActionProps } from "./types";
import { selectionVariants } from "./variants";

export const SelectionModeAction = ({
  className,
  icon,
  onPress,
  onClick,
  exitOnPress = false,
  disabled = false,
  destructive,
  labelClassName,
  children,
  ...props
}: SelectionModeActionProps) => {
  const { selected, exit, count, sheet } = useSelectionMode();
  const color = useThemeToken("destructive");
  const off = disabled || count === 0;
  const slots = selectionVariants({
    compact: sheet,
    destructive,
    disabled: off,
  });
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: off }}
      disabled={off}
      className={cn(slots.action(), "flex", className)}
      onPress={(event) => {
        if (onClick) {
          onClick(event);
        } else {
          onPress?.(selected);
        }
        if (exitOnPress) {
          exit();
        }
      }}
    >
      <IconColorProvider color={destructive ? color : undefined}>
        {icon}
      </IconColorProvider>
      {textChildren(children, (text) => (
        <Text className={cn(slots.actionLabel(), labelClassName)}>{text}</Text>
      ))}
    </AnimatedPressable>
  );
};
SelectionModeAction.displayName = "SelectionMode.Action";
