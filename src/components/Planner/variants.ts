import { tv } from "../../lib/variants";

export const plannerVariants = tv({
  slots: {
    grid: "flex flex-col gap-[8px] px-[24px] pt-[8px] pb-[24px]",
    week: "flex flex-row",
    heading: "flex-1 text-center",
    legend:
      "flex flex-row flex-wrap items-center gap-x-[32px] gap-y-[16px] px-[32px] py-[24px]",
    swatch: "h-[16px] w-[16px] rounded-full",
  },
  variants: {
    fill: { true: { grid: "flex flex-1 flex-col", week: "flex-1" } },
  },
});
