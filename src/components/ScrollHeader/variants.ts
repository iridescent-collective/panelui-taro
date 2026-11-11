import { tv } from "../../lib/variants";

export const scrollHeaderVariants = tv({
  slots: {
    root: "flex-1",
    band: "absolute inset-x-[0px] top-[0px] overflow-hidden",
    cover: "absolute inset-[0px]",
    bar: "absolute inset-x-[0px] top-[0px] flex flex-row items-center gap-[24px] px-[32px]",
    barSurface: "absolute inset-[0px]",
    large: "absolute inset-x-[0px] bottom-[0px] gap-[8px] px-[32px] pb-[24px]",
    actions: "ml-auto flex flex-row items-center gap-[8px]",
  },
  variants: {
    surface: {
      plain: { barSurface: "bg-[var(--panel-background)]" },
      muted: { barSurface: "bg-[var(--panel-card)]" },
      none: { barSurface: "bg-transparent" },
      blur: { barSurface: "bg-transparent" },
    },
    divider: {
      true: {
        barSurface: "border-b-[2px] border-solid border-[var(--panel-border)]",
      },
      false: {},
    },
  },
  defaultVariants: {
    surface: "plain",
    divider: true,
  },
});
