import { View } from "@tarojs/components";
import type { ComponentType } from "react";

import { RotateCcwIcon, RotateCwIcon, TrashIcon } from "../../icons";
import type { IconProps } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { SignatureButtonProps, SignatureToolbarProps } from "./types";

export const SignatureToolbar = ({
  className,
  ...props
}: SignatureToolbarProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-row items-center justify-between gap-[16px]",
      className
    )}
  />
);
const circleButton = (
  Icon: ComponentType<IconProps>,
  label: string,
  displayName: string
) => {
  const Control = ({
    className,
    disabled,
    children,
    accessibilityLabel,
    ...props
  }: SignatureButtonProps) => (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      hitSlop={8}
      className={cn(
        "flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--panel-muted)]",
        disabled && "opacity-[0.48]",
        className
      )}
      {...props}
    >
      {children ?? <Icon size={16} />}
    </AnimatedPressable>
  );
  Control.displayName = displayName;
  return Control;
};
export const SignatureUndo = circleButton(
  RotateCcwIcon,
  "Undo last stroke",
  "Signature.Undo"
);
export const SignatureRedo = circleButton(
  RotateCwIcon,
  "Redo last stroke",
  "Signature.Redo"
);
export const SignatureClear = circleButton(
  TrashIcon,
  "Clear signature",
  "Signature.Clear"
);
