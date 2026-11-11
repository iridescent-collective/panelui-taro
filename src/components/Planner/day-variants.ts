import { tv } from "../../lib/variants";

export const dayVariants = tv({
  slots: {
    cell: "relative mx-[4px] flex h-[112px] flex-1 flex-col rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-transparent px-[12px] pt-[12px]",
    number: "text-[24px] leading-none",
    marker: "absolute top-[12px] right-[12px] h-[12px] w-[12px] rounded-full",
    body: "flex flex-1 flex-row items-center justify-center gap-[4px] pb-[8px]",
    tint: "absolute inset-[0px] rounded-[var(--panel-radius-xl)]",
    corner: "absolute right-[12px] bottom-[8px]",
    counter: "absolute top-[8px] left-[12px]",
    chip: "w-full overflow-hidden rounded-[var(--panel-radius-sm)] bg-[var(--panel-muted)] px-[8px] py-[4px]",
    overflow: "leading-none",
  },
  variants: {
    fill: { true: { cell: "h-auto min-h-[0px] flex-1" } },
    inMonth: {
      true: {
        cell: "bg-[var(--panel-muted-opacity-40)]",
        number: "text-[color:var(--panel-foreground)]",
      },
      false: {
        cell: "bg-[var(--panel-muted-opacity-15)]",
        number: "text-[color:var(--panel-muted-foreground-opacity-40)]",
      },
    },
    today: {
      true: {
        cell: "border-[var(--panel-foreground)]",
        number: "font-semibold",
      },
    },
    selected: {
      true: {
        cell: "border-[var(--panel-primary-opacity-60)] bg-[var(--panel-primary-opacity-10)]",
      },
    },
    disabled: { true: { cell: "opacity-40" } },
    variant: {
      default: {},
      tiles: {
        cell: "h-full items-center justify-center px-[0px] pt-[0px]",
        overflow: "leading-none",
      },
      calendar: {
        cell: "relative mx-[0px] flex h-full min-h-[0px] flex-col items-stretch gap-px rounded-none border-transparent bg-transparent px-[8px] pt-[12px] pb-[8px]",
        number: "text-center",
        body: "flex flex-col items-stretch justify-start gap-px pb-[0px]",
        overflow: "text-center leading-none",
      },
    },
  },
  compoundVariants: [
    {
      today: true,
      selected: true,
      class: {
        cell: "border-[var(--panel-foreground)] bg-[var(--panel-primary-opacity-10)]",
      },
    },
  ],
  defaultVariants: { inMonth: true, variant: "default" },
});
