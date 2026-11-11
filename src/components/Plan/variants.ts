import { tv } from "../../lib/variants";

export const planVariants = tv({
  slots: {
    root: "w-full overflow-hidden rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] shadow-sm",
    header: "flex flex-row items-start gap-[24px] p-[32px]",
    icon: "h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)]",
    heading: "min-w-[0px] flex-1 gap-[8px]",
    title:
      "text-[32px] leading-[1.5] font-semibold text-[color:var(--panel-card-foreground)]",
    description:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-muted-foreground)]",
    action: "flex shrink-0 flex-row items-center gap-[8px]",
    progress:
      "text-[24px] leading-[1.333333] font-medium text-[color:var(--panel-muted-foreground)]",
    trigger:
      "h-[64px] w-[64px] items-center justify-center rounded-full active:bg-[var(--panel-accent)]",
    content: "gap-[16px] px-[32px] pb-[32px]",
    steps: "w-full",
    step: "flex w-full flex-row gap-[24px]",
    stepRail: "w-[32px] items-center pt-[2px]",
    stepMarker: "h-[32px] w-[32px] items-center justify-center rounded-full",
    stepConnector: "w-[2px] flex-1 rounded-full",
    stepBody: "min-w-[0px] flex-1 gap-[4px] pb-[24px]",
    stepTitle: "text-[28px] leading-[1.428571]",
    stepDescription:
      "text-[24px] leading-[1.333333] text-[color:var(--panel-muted-foreground)]",
    stepMeta:
      "self-start rounded-[var(--panel-radius-md)] bg-[var(--panel-muted)] px-[12px] py-[4px] font-mono text-[22px] text-[color:var(--panel-muted-foreground)]",
    footer:
      "flex flex-row items-center gap-[16px] border-t-[2px] border-solid border-[var(--panel-border)] p-[32px]",
  },
});
