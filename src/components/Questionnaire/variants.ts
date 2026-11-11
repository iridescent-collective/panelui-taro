import { tv } from "../../lib/variants";

export const questionnaireVariants = tv({
  slots: {
    body: "overflow-hidden",
    slide: "absolute inset-x-[0px] top-[0px]",
    pane: "gap-[32px]",
    choices: "gap-[20px]",
    footer: "flex flex-row items-center gap-[16px]",
    error:
      "text-[28px] leading-[1.428571] text-[color:var(--panel-destructive)]",
  },
  variants: {
    framed: {
      true: { pane: "p-[32px]", footer: "p-[24px]" },
      false: { pane: "py-[32px]", footer: "pt-[24px]" },
    },
  },
  defaultVariants: {
    framed: true,
  },
});
