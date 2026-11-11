import { View } from "@tarojs/components";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken as usePanelsideToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { ctaVariants } from "./cta-variants";
import { Glyph, Search01Icon } from "./glyph";
import type {
  PanelsideGroupProps,
  PanelsideGroupLabelProps,
  PanelsideCtaProps,
  PanelsideSearchTriggerProps,
} from "./types";

export const PanelsideGroup = ({
  className,
  children,
  ...props
}: PanelsideGroupProps) => (
  <View
    className={cn("flex flex-col gap-[4px] pb-[16px]", className)}
    {...props}
  >
    {textChildren(children)}
  </View>
);
export const PanelsideGroupLabel = ({
  className,
  children,
  ...props
}: PanelsideGroupLabelProps) => (
  <View
    className={cn("px-[24px] pt-[24px] pb-[8px]", className)}
    role="heading"
    aria-role="heading"
    {...props}
  >
    {textChildren(children, (text) => (
      <Text size="xs" weight="medium" muted>
        {text}
      </Text>
    ))}
  </View>
);
export const PanelsideCta = ({
  className,
  label,
  icon,
  variant = "primary",
  size = "default",
  native: _native = false,
  glass: _glass = false,
  disabled,
  children,
  ...props
}: PanelsideCtaProps) => {
  const primaryTint = usePanelsideToken("primary-foreground");
  const secondaryTint = usePanelsideToken("secondary-foreground");
  const raw = variant === "primary" ? primaryTint : secondaryTint;
  const tint = typeof raw === "string" ? raw : undefined;
  return (
    <AnimatedPressable
      className={ctaVariants({ className, size, variant })}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      {...props}
    >
      <IconColorProvider color={tint}>
        {icon}
        {label ? (
          <Text
            size={size === "lg" ? "lg" : "base"}
            weight="medium"
            numberOfLines={1}
            className={cn(
              "shrink",
              variant === "primary"
                ? "text-[color:var(--panel-primary-foreground)]"
                : "text-[color:var(--panel-secondary-foreground)]"
            )}
          >
            {label}
          </Text>
        ) : null}
        {textChildren(children)}
      </IconColorProvider>
    </AnimatedPressable>
  );
};
export const PanelsideSearchTrigger = ({
  className,
  label = "Search",
  variant = "filled",
  children,
  native = false,
  glass: _glass = false,
  onPress,
  ...props
}: PanelsideSearchTriggerProps) => {
  const tint = usePanelsideToken("foreground");
  const color = typeof tint === "string" ? tint : undefined;
  const open = onPress;
  const glyph = children ?? (
    <Glyph icon={Search01Icon} size={18} color={native ? color : undefined} />
  );
  return (
    <AnimatedPressable
      {...props}
      onPress={open}
      className={cn(
        "flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full",
        variant === "outline"
          ? "border-[2px] border-solid border-[var(--panel-border)]"
          : "bg-[var(--panel-secondary)]",
        className
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconColorProvider color={color}>{glyph}</IconColorProvider>
    </AnimatedPressable>
  );
};
