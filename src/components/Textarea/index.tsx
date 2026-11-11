import { Textarea as NativeTextarea, View } from "@tarojs/components";
import { forwardRef } from "react";

import type { InputHandle } from "../Input/types";
import { useInput } from "../Input/use-input";
import { Label } from "../Label";
import { textareaFieldProps } from "./field-props";
import { TextareaFooter } from "./Footer";
import type { TextareaProps } from "./types";
import { useTextareaPresentation } from "./use-presentation";

export type { TextareaProps, ContentSizeEvent } from "./types";
export type { InputHandle as TextareaHandle } from "../Input/types";

export const Textarea = forwardRef<InputHandle, TextareaProps>((props, ref) => {
  const state = useInput(props, ref);
  const presentation = useTextareaPresentation(props, state);
  return (
    <View
      className={presentation.slots.container({
        className: `flex flex-col ${props.containerClassName ?? ""}`,
      })}
      style={presentation.keyboard.dockStyle}
    >
      {props.label ? (
        <Label
          isRequired={props.isRequired}
          isInvalid={presentation.invalid}
          isDisabled={!!state.blocked}
        >
          {props.label}
        </Label>
      ) : null}
      <NativeTextarea {...textareaFieldProps(props, state, presentation)} />
      <TextareaFooter textarea={props} presentation={presentation} />
    </View>
  );
});
Textarea.displayName = "Textarea";
