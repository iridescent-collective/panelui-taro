import { tv } from "../../lib/variants";

export const dayVariants = tv({
  slots: {
    cell: "h-[80px] flex-1 items-center justify-center",
    band: "absolute inset-y-[4px] bg-[var(--panel-accent)]",
    disc: "h-[72px] w-[72px] items-center justify-center rounded-[var(--panel-radius-lg)]",
    label: "text-[28px] leading-[1.428571]",
  },
  variants: {
    selected: {
      true: {
        disc: "bg-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary-foreground)]",
      },
    },
    today: {
      true: {
        disc: "border-[2px] border-solid border-[var(--panel-primary)]",
        label: "text-[color:var(--panel-primary)]",
      },
    },
    outside: {
      true: { label: "text-[color:var(--panel-muted-foreground-opacity-40)]" },
    },
    disabled: {
      true: { label: "text-[color:var(--panel-muted-foreground-opacity-30)]" },
    },
    fadedBand: { true: { band: "opacity-40" } },
  },
  compoundVariants: [
    {
      selected: true,
      today: true,
      class: { label: "text-[color:var(--panel-primary-foreground)]" },
    },
  ],
});
