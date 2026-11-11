import { tv } from "../../lib/variants";

export const imageGenerationVariants = tv({
  slots: {
    root: "w-full",
    frame:
      "relative w-full overflow-hidden rounded-[var(--panel-radius-2xl)] bg-[var(--panel-muted)]",
    media: "absolute inset-[0px]",
    resolution:
      "absolute end-2 top-[16px] rounded-full bg-[var(--panel-background-opacity-75)] px-[16px] py-[4px] text-[20px] text-[color:var(--panel-muted-foreground)]",
    status: "mt-[24px] flex flex-row items-center gap-[16px]",
    statusText:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
    prompt:
      "mt-[4px] text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    retry:
      "mt-[24px] flex min-h-[96px] flex-row items-center gap-[16px] self-start rounded-full px-[24px] active:bg-[var(--panel-accent)]",
    retryLabel:
      "text-[28px] leading-[1.428571] font-medium text-[color:var(--panel-foreground)]",
  },
  variants: {
    size: {
      compact: { root: "max-w-[416px] self-center" },
      fluid: {},
    },
    error: {
      true: { statusText: "text-[color:var(--panel-destructive)]" },
    },
  },
  defaultVariants: {
    size: "compact",
  },
});
