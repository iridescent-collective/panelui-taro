import { tv } from "../../lib/variants";

export const aiInputVariants = tv({
  slots: {
    root: "w-full shadow-md",
    field:
      "w-full bg-transparent px-[32px] font-normal text-[color:var(--panel-foreground)]",
    fieldInline:
      "flex-1 bg-transparent px-[16px] font-normal text-[color:var(--panel-foreground)]",
    row: "flex w-full flex-row items-center gap-[12px] p-[16px]",
    toolbar: "flex w-full flex-row items-center gap-[16px] px-[16px] pb-[16px]",
    spacer: "flex-1",
    pill: "flex flex-row items-center gap-[12px] px-[24px]",
    recording:
      "flex w-full flex-row items-center gap-[24px] px-[16px] pb-[16px]",
    meter: "flex-1",
  },
  variants: {
    size: {
      sm: { toolbar: "gap-[12px]" },
      md: {},
      lg: { toolbar: "gap-[20px]" },
    },
    disabled: {
      true: { root: "opacity-60" },
      false: {},
    },
  },
  defaultVariants: { size: "md", disabled: false },
});
