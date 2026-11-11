import {
  Input as NativeInput,
  Textarea as NativeTextarea,
  View,
} from "@tarojs/components";

import { InputContent } from "../Content";
import { inputFieldProps } from "../field-props";
import type { InputProps } from "../types";
import type { useInput } from "../use-input";
import type { useInputPresentation } from "../use-presentation";

export interface InputBodyProps {
  input: InputProps;
  state: ReturnType<typeof useInput>;
  presentation: ReturnType<typeof useInputPresentation>;
}
export const InputBody = ({ input, state, presentation }: InputBodyProps) => {
  const common = inputFieldProps(input, state, presentation);
  const field = input.multiline ? (
    <NativeTextarea {...common} autoHeight />
  ) : (
    <NativeInput {...common} />
  );
  if (!input.startContent && !input.endContent) {
    return field;
  }
  const { slots, start, end, direction, colors } = presentation;
  return (
    <View className={slots.fieldBox()}>
      {input.startContent ? (
        <InputContent
          id={start.id}
          color={colors.placeholder}
          className={slots.startContent()}
          side={direction === "ltr" ? "left" : "right"}
          interactive={input.interactiveContent ?? true}
        >
          {input.startContent}
        </InputContent>
      ) : null}
      {field}
      {input.endContent ? (
        <InputContent
          id={end.id}
          color={colors.placeholder}
          className={slots.endContent()}
          side={direction === "ltr" ? "right" : "left"}
          interactive={input.interactiveContent ?? true}
        >
          {input.endContent}
        </InputContent>
      ) : null}
    </View>
  );
};
