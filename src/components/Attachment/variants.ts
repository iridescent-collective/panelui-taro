import { tv } from "../../lib/variants";

export const rootVariants = tv({
  base: "",
  variants: {
    state: {
      idle: "",
      uploading: "",
      processing: "",
      error: "border-[2px] border-solid border-[var(--panel-destructive)]",
      done: "",
    },
  },
});
