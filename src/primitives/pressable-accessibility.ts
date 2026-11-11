import type { View } from "@tarojs/components";
import type { AriaAttributes, ComponentProps } from "react";

interface PressableAccessibility {
  role?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  state?: {
    checked?: boolean | "mixed";
    selected?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    busy?: boolean;
  };
}
export const resolvePressableAccessibility = (
  props: ComponentProps<typeof View> &
    AriaAttributes & { "aria-role"?: string },
  aliases: PressableAccessibility
) => ({
  "aria-busy": aliases.state?.busy ?? props["aria-busy"],
  "aria-checked": aliases.state?.checked ?? props["aria-checked"],
  "aria-description": aliases.hint ?? props["aria-description"],
  "aria-disabled":
    aliases.disabled ?? aliases.state?.disabled ?? props["aria-disabled"],
  "aria-expanded": aliases.state?.expanded ?? props["aria-expanded"],
  "aria-label": aliases.label ?? props["aria-label"],
  "aria-role": aliases.role ?? props["aria-role"] ?? props.role,
  "aria-selected": aliases.state?.selected ?? props["aria-selected"],
  role: aliases.role ?? props.role,
});
