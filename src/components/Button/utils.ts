import { cn } from "../../lib/utils";
import type { ButtonGroupContextValue } from "./context";
import type { ButtonProps } from "./index";
import { buttonVariants } from "./variants";

export const resolveButtonPresentation = (
  props: Pick<ButtonProps, "variant" | "size" | "fullWidth" | "className">,
  group: ButtonGroupContextValue | null,
  blocked: boolean | undefined
) => {
  const variant = props.variant ?? group?.variant ?? "primary";
  const size = props.size ?? group?.size ?? "md";
  const attached = group?.attached === true;
  let hoverClass = attached
    ? "panelui-button-attached-pressed"
    : "panelui-button-pressed";
  if (blocked) {
    hoverClass = "none";
  }
  const slots = buttonVariants({
    disabled: !!blocked,
    fullWidth: props.fullWidth ?? (attached && group?.fullWidth),
    size,
    variant,
  });
  const className = slots.root({
    className: cn(
      "panelui-button m-0",
      attached && "rounded-none border-transparent shadow-none",
      attached && group?.fullWidth && "flex-1",
      props.className
    ),
  });
  return { className, hoverClass, size, slots, variant };
};
