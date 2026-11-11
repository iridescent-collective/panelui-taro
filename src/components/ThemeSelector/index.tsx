import { View } from "@tarojs/components";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { ReactNode, ComponentProps } from "react";

import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps as PressableProps } from "../../primitives/animated-pressable";
import {
  useTheme,
  useThemeMode,
  useThemePreference,
} from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { ThemePreview } from "./theme-preview";
import type { ThemePreviewVariant } from "./theme-preview";
import { themeSelectorVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;

export type { ThemePreviewVariant } from "./theme-preview";

export type ThemeSelection = "system" | "light" | "dark";

export type ThemeSelectorSize = "sm" | "md";

const OPTIONS: readonly ThemeSelection[] = ["system", "light", "dark"];

const LABELS: Record<ThemeSelection, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
};

const PREVIEW_WIDTH: Record<ThemeSelectorSize, number> = { md: 88, sm: 72 };

interface ThemeSelectorContextValue {
  value: ThemeSelection;
  select: (value: ThemeSelection) => void;
  variant: ThemePreviewVariant;
  size: ThemeSelectorSize;
  disabled: boolean;
}

const ThemeSelectorContext = createContext<ThemeSelectorContextValue | null>(
  null
);

const useThemeSelector = (part: string): ThemeSelectorContextValue => {
  const value = useContext(ThemeSelectorContext);
  if (!value) {
    throw new Error(`${part} must be used inside a <ThemeSelector>.`);
  }
  return value;
};

export const useThemeSelection = (): ThemeSelection => {
  const adaptive = useThemePreference() === "system";
  const { mode } = useThemeMode();
  return adaptive ? "system" : mode;
};

export interface ThemeSelectorProps extends Omit<ViewProps, "children"> {
  className?: string;

  value?: ThemeSelection;

  onValueChange?: (value: ThemeSelection) => void;

  applyTheme?: boolean;

  label?: string;

  variant?: ThemePreviewVariant;

  size?: ThemeSelectorSize;

  disabled?: boolean;

  children?: ReactNode;
}

export interface ThemeSelectorOptionProps extends Omit<
  PressableProps,
  "children" | "onPress"
> {
  className?: string;

  value: ThemeSelection;

  label?: string;

  children?: ReactNode;
}

const ThemeSelectorOption = ({
  className,
  value,
  label,
  children,
  ...props
}: ThemeSelectorOptionProps) => {
  const context = useThemeSelector("ThemeSelector.Option");
  const selected = context.value === value;
  const slots = themeSelectorVariants({ disabled: context.disabled, selected });
  const name = label ?? LABELS[value];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={name}
      accessibilityState={{ disabled: context.disabled, selected }}
      disabled={context.disabled}
      {...props}
      onPress={() => {
        if (!context.disabled) {
          context.select(value);
        }
      }}
      className={slots.option({
        className: `flex flex-col ${className ?? ""}`,
      })}
    >
      <View className={slots.frame()}>
        <View className={slots.preview()}>
          {children ?? (
            <ThemePreview
              mode={value}
              variant={context.variant}
              width={PREVIEW_WIDTH[context.size]}
            />
          )}
        </View>
      </View>
      <Text size="sm" className={slots.label()}>
        {name}
      </Text>
    </Pressable>
  );
};

const ThemeSelectorRoot = ({
  className,
  value,
  onValueChange,
  applyTheme = true,
  label,
  variant = "window",
  size = "md",
  disabled = false,
  children,
  ...props
}: ThemeSelectorProps) => {
  const slots = themeSelectorVariants({ disabled });
  const { setTheme } = useTheme();
  const { setMode } = useThemeMode();
  const live = useThemeSelection();
  const current = value ?? live;

  const select = useCallback(
    (next: ThemeSelection) => {
      onValueChange?.(next);
      if (!applyTheme) {
        return;
      }

      if (next === "system") {
        setTheme("system");
      } else {
        setMode(next);
      }
    },
    [applyTheme, onValueChange, setTheme, setMode]
  );

  const context = useMemo<ThemeSelectorContextValue>(
    () => ({ disabled, select, size, value: current, variant }),
    [current, select, variant, size, disabled]
  );

  return (
    <ThemeSelectorContext.Provider value={context}>
      <View
        role="radiogroup"
        aria-role="radiogroup"
        aria-label={label}
        {...props}
        className={slots.root({
          className: `flex flex-col ${className ?? ""}`,
        })}
      >
        {label ? (
          <Text size="sm" className={slots.legend()}>
            {label}
          </Text>
        ) : null}
        <View className={slots.options()}>
          {children
            ? textChildren(children)
            : OPTIONS.map((option) => (
                <ThemeSelectorOption key={option} value={option} />
              ))}
        </View>
      </View>
    </ThemeSelectorContext.Provider>
  );
};

ThemeSelectorRoot.displayName = "ThemeSelector";
ThemeSelectorOption.displayName = "ThemeSelector.Option";

export const ThemeSelector = Object.assign(ThemeSelectorRoot, {
  Option: ThemeSelectorOption,
});
