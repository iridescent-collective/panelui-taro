import { tv } from "../../lib/variants";

export const switchVariants = tv({
  slots: {
    track:
      "justify-center rounded-full border-[2px] border-solid border-transparent bg-[var(--panel-input)] p-[6px]",
    activeTrack: "absolute inset-[0px] rounded-full bg-[var(--panel-primary)]",
    thumb: "rounded-full bg-white shadow-sm",
  },
  variants: {
    size: {
      xs: { track: "h-[40px] w-[64px]", thumb: "h-[24px] w-[24px]" },
      sm: { track: "h-[48px] w-[80px]", thumb: "h-[32px] w-[32px]" },
      md: { track: "h-[56px] w-[96px]", thumb: "h-[40px] w-[40px]" },
      lg: { track: "h-[64px] w-[112px]", thumb: "h-[48px] w-[48px]" },
      xl: { track: "h-[72px] w-[128px]", thumb: "h-[56px] w-[56px]" },
    },
    disabled: {
      true: { track: "opacity-50" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
