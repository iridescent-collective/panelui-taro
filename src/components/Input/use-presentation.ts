import { useDirection } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import {
  useFieldColors,
  fieldKeyboard,
} from "../../primitives/field/presentation";
import { hiddenInputStyle } from "../../primitives/hidden-input-style";
import { inputContentPadding } from "./input-content-padding";
import type { InputProps } from "./types";
import type { useInput } from "./use-input";
import { inputVariants } from "./variants";

export const useInputPresentation = (
  props: InputProps,
  state: ReturnType<typeof useInput>
) => {
  const direction = useDirection();
  const start = useElementLayout(!!props.startContent, props.startContent);
  const end = useElementLayout(!!props.endContent, props.endContent);
  const invalid = !!props.errorMessage;
  const colors = useFieldColors(invalid, state.focused);
  const reducedMotion = usePanelReducedMotion();
  const slots = inputVariants({
    disabled: !!state.blocked,
    multiline: !!props.multiline,
    size: props.size,
    variant: props.variant,
  });
  const startPadding = inputContentPadding(
    start.layout?.width ?? 0,
    !!props.startContent
  );
  const endPadding = inputContentPadding(
    end.layout?.width ?? 0,
    !!props.endContent
  );
  const left = direction === "ltr" ? startPadding : endPadding;
  const right = direction === "rtl" ? startPadding : endPadding;
  const fieldStyle = mergeStyle(
    {
      borderColor: colors.border,
      direction,
      paddingLeft: left ? `${left * 2}rpx` : undefined,
      paddingRight: right ? `${right * 2}rpx` : undefined,
      transition: reducedMotion ? "none" : "border-color 150ms ease",
    },
    props.style
  );
  return {
    colors,
    direction,
    end,
    fieldStyle: props.visuallyHidden
      ? mergeStyleAfter(fieldStyle, hiddenInputStyle)
      : fieldStyle,
    invalid,
    keyboard: fieldKeyboard(props, state),
    slots,
    start,
  };
};
