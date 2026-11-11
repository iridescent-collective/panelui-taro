import { tv } from "../../lib/variants";

export const crumbText = tv({
  base: "",
  variants: {
    size: {
      sm: "text-[24px] leading-[1.333333]",
      default: "text-[28px] leading-[1.428571]",
    },
  },
  defaultVariants: { size: "default" },
});
