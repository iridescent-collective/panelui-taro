import { tv } from "../../lib/variants";

export const treeVariants = tv({
  slots: {
    root: "w-full",
    item: "",
    trigger:
      "flex flex-row items-center gap-[16px] rounded-[var(--panel-radius-lg)]",
    indicator: "flex items-center justify-center",
    icon: "flex items-center justify-center",
    label: "flex-1 text-[color:var(--panel-foreground)]",
    actions: "flex flex-row items-center gap-[8px]",
    group: "border-[var(--panel-border)]",
  },
  variants: {
    size: {
      sm: {
        trigger: "px-[12px] py-[8px]",
        indicator: "flex h-[32px] w-[32px]",
        icon: "flex h-[32px] w-[32px]",
        label: "text-[24px] leading-[1.333333]",
      },
      default: {
        trigger: "px-[16px] py-[12px]",
        indicator: "flex h-[40px] w-[40px]",
        icon: "flex h-[40px] w-[40px]",
        label: "text-[28px] leading-[1.428571]",
      },
    },
    isSelected: {
      true: {
        trigger: "bg-[var(--panel-accent)]",
        label: "font-medium text-[color:var(--panel-accent-foreground)]",
      },
    },
    isDisabled: {
      true: { trigger: "opacity-50" },
    },
  },
  defaultVariants: {
    size: "default",
  },
});
