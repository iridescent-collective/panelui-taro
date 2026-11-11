import { Input, View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon, XIcon } from "../../icons";
import { interpolatePanelColor } from "../../lib/interpolate-color";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useChartTween } from "../../primitives/chart-tween";
import { useThemeToken } from "../../theme/use-theme";
import { Chip } from "../Chip";
import type { ComboboxMode, ComboboxProps } from "./types";
import type { useComboboxModel } from "./use-model";
import { comboboxVariants } from "./variants";

export const ComboboxField = <Mode extends ComboboxMode>({
  props,
  model,
}: {
  props: ComboboxProps<Mode>;
  model: ReturnType<typeof useComboboxModel<Mode>>;
}) => {
  const {
    placeholder = "Search",
    disabled = false,
    openOnFocus = false,
    clearable = false,
    accessibilityLabel,
    allowCustomValue = false,
  } = props;
  const slots = comboboxVariants({ disabled });
  const muted = useThemeToken("muted-foreground");
  const idle = useThemeToken("input");
  const ring = useThemeToken("ring");
  const reduced = usePanelReducedMotion();
  const focusMotion = useChartTween(0);
  const chevronMotion = useChartTween(0);
  useEffect(() => {
    focusMotion.timingTo(model.focused ? 1 : 0, reduced ? 0 : 150);
  }, [model.focused, reduced, focusMotion.timingTo]);
  useEffect(() => {
    chevronMotion.timingTo(model.open ? 1 : 0, reduced ? 0 : 160);
  }, [model.open, reduced, chevronMotion.timingTo]);
  const focus = useSyncExternalStore(
    focusMotion.signal.subscribe,
    focusMotion.signal.getSnapshot,
    focusMotion.signal.getSnapshot
  );
  const chevron = useSyncExternalStore(
    chevronMotion.signal.subscribe,
    chevronMotion.signal.getSnapshot,
    chevronMotion.signal.getSnapshot
  );
  const hasContent = model.query.length > 0 || model.values.length > 0;
  return (
    <View
      className={slots.field()}
      aria-role="combobox"
      aria-label={accessibilityLabel}
      aria-disabled={disabled}
      aria-expanded={model.open}
      style={{
        borderColor: interpolatePanelColor(idle, ring, focus),
      }}
    >
      <View className={slots.fieldContent()}>
        {model.multiple
          ? model.values.map((entry) => (
              <Chip
                key={entry}
                size="sm"
                className="self-center"
                onClose={disabled ? undefined : () => model.remove(entry)}
                closeLabel={`Remove ${model.labelOf(entry)}`}
              >
                {model.labelOf(entry)}
              </Chip>
            ))
          : null}
        <Input
          className={slots.input()}
          value={model.query}
          disabled={disabled}
          focus={model.focusInput}
          adjustPosition
          placeholder={
            model.values.length && model.multiple ? undefined : placeholder
          }
          placeholderStyle={`color:${muted}`}
          aria-label={accessibilityLabel ?? placeholder}
          confirmType={allowCustomValue ? "done" : "search"}
          confirmHold={model.multiple}
          onInput={(event) => {
            if (disabled) {
              return;
            }
            model.setQuery(event.detail.value);
            if (!model.open) {
              model.openList();
            }
          }}
          onFocus={() => {
            model.setFocused(true);
            model.setFocusInput(true);
            if (openOnFocus) {
              model.openList();
            }
          }}
          onBlur={() => {
            model.setFocused(false);
            model.setFocusInput(false);
          }}
          onConfirm={model.submit}
        />
      </View>
      {clearable && hasContent && !disabled ? (
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Clear"
          onPress={model.clear}
          pressScale={1}
          className={slots.action({ className: "flex" })}
        >
          <XIcon size={16} color={muted} />
        </AnimatedPressable>
      ) : null}
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={model.open ? "Hide options" : "Show options"}
        accessibilityState={{ expanded: model.open }}
        disabled={disabled}
        pressScale={1}
        onPress={() => {
          if (model.open) {
            model.close();
          } else {
            model.openList();
            model.setFocusInput(true);
          }
        }}
        className={slots.action({ className: "flex" })}
      >
        <View
          style={{
            transform: `rotate(${chevron * 180}deg)`,
          }}
        >
          <ChevronDownIcon color={muted} />
        </View>
      </AnimatedPressable>
    </View>
  );
};
