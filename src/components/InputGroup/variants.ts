import { tv } from "../../lib/variants";

export const inputGroupVariants = tv({
  slots: {
    root: "w-full",
    prefix:
      "absolute start-0 top-[0px] bottom-[0px] z-10 flex flex-row items-center justify-center gap-[16px] px-[24px]",
    suffix:
      "absolute end-0 top-[0px] bottom-[0px] z-10 flex flex-row items-center justify-center gap-[16px] px-[24px]",
  },
  variants: {
    isDisabled: {
      true: { prefix: "opacity-[0.64]", suffix: "opacity-[0.64]" },
    },
  },
});
