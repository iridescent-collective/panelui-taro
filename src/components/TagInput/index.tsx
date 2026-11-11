import { View } from "@tarojs/components";
import { forwardRef } from "react";

import type { InputHandle } from "../Input/types";
import { Label } from "../Label";
import { TagCaption } from "./caption";
import { TagField } from "./field";
import type { TagInputProps } from "./types";
import { useTagField } from "./use-field";
import { useTags } from "./use-tags";
import { tagInputVariants } from "./variants";

export type {
  TagInputProps,
  TagInputVariant,
  TagInputSize,
  TagRejection,
  TagBlurBehavior,
} from "./types";
export const TagInput = forwardRef<InputHandle, TagInputProps>((props, ref) => {
  const state = useTags(props);
  const field = useTagField(props, state, ref);
  const overflowing = props.max !== undefined && state.tags.length > props.max;
  const invalid = !!props.errorMessage || overflowing;
  const slots = tagInputVariants({
    disabled: !!props.disabled,
    size: props.size,
    variant: props.variant,
  });
  return (
    <View
      className={`flex flex-col ${slots.container({ className: props.containerClassName })}`}
    >
      {props.label ? (
        <Label
          isRequired={props.isRequired}
          isInvalid={invalid}
          isDisabled={props.disabled}
        >
          {props.label}
        </Label>
      ) : null}
      <TagField props={props} state={state} field={field} invalid={invalid} />
      <TagCaption
        props={props}
        count={state.tags.length}
        overflowing={overflowing}
      />
    </View>
  );
});
TagInput.displayName = "TagInput";
