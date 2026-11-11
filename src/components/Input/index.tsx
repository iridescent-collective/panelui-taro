import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ReactNode } from "react";

import { Label } from "../Label";
import { Text } from "../primitives/Text";
import { InputBody } from "./Body";
import type { InputHandle, InputProps } from "./types";
import { useInput } from "./use-input";
import { useInputPresentation } from "./use-presentation";

export type {
  InputHandle,
  InputProps,
  InputSize,
  InputVariant,
  KeyboardAvoidanceMode,
} from "./types";

export const Input = forwardRef<InputHandle, InputProps>((props, ref) => {
  const state = useInput(props, ref);
  const presentation = useInputPresentation(props, state);
  const { slots, invalid, keyboard } = presentation;
  let message: ReactNode = null;
  if (props.description) {
    message = <Text className={slots.description()}>{props.description}</Text>;
  }
  if (props.errorMessage) {
    message = <Text className={slots.error()}>{props.errorMessage}</Text>;
  }
  return (
    <View
      className={slots.container({
        className: `flex flex-col ${props.containerClassName ?? ""}`,
      })}
      style={keyboard.dockStyle}
    >
      {props.label ? (
        <Label
          isRequired={props.isRequired}
          isInvalid={invalid}
          isDisabled={!!state.blocked}
        >
          {props.label}
        </Label>
      ) : null}
      <InputBody input={props} state={state} presentation={presentation} />
      {message}
    </View>
  );
});
Input.displayName = "Input";
