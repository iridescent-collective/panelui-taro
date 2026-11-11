import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";

export interface OtpCellProps {
  char: string;
  active: boolean;
  focused: boolean;
  mask: boolean;
  placeholder?: string;
  invalid: boolean;
  className: string;
  charClassName: string;
  caretClassName: string;
}
export const OtpCell = ({
  char,
  active,
  focused,
  mask,
  placeholder,
  invalid,
  className,
  charClassName,
  caretClassName,
}: OtpCellProps) => {
  const rest = useThemeToken("input");
  const ring = useThemeToken("ring");
  const destructive = useThemeToken("destructive");
  const muted = useThemeToken("muted-foreground");
  const reduced = usePanelReducedMotion();
  const lit = active && focused;
  let borderColor = rest;
  if (lit) {
    borderColor = ring;
  }
  if (invalid) {
    borderColor = destructive;
  }
  let content: ReactNode = null;
  if (char) {
    content = (
      <Text
        key={char}
        className={charClassName}
        style={{
          animation: reduced ? "none" : "panel-otp-enter 140ms ease-out",
        }}
      >
        {mask ? "•" : char}
      </Text>
    );
  } else if (lit) {
    content = (
      <View
        className={caretClassName}
        style={{
          animation: reduced
            ? "none"
            : "panel-otp-caret 1121ms ease-in-out infinite",
        }}
      />
    );
  } else if (placeholder) {
    content = (
      <Text className={charClassName} style={{ color: muted }}>
        {placeholder}
      </Text>
    );
  }
  return (
    <View
      className={className}
      style={{
        borderColor,
        borderWidth: lit ? "4rpx" : "2rpx",
        transition: reduced
          ? "none"
          : "border-color 150ms ease-in-out,border-width 150ms ease-in-out",
      }}
    >
      {content}
    </View>
  );
};
