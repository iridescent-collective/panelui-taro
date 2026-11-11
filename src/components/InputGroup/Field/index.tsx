import { forwardRef } from "react";

import { useDirection } from "../../../hooks/use-direction";
import { mergeStyle } from "../../../lib/styles";
import { Input } from "../../Input";
import type { InputHandle } from "../../Input/types";
import { useInputGroup } from "../context";
import type { InputGroupInputProps } from "../types";

export const InputGroupInput = forwardRef<InputHandle, InputGroupInputProps>(
  ({ style, disabled, ...props }, ref) => {
    const group = useInputGroup();
    const direction = useDirection();
    const left = direction === "ltr" ? group?.prefixWidth : group?.suffixWidth;
    const right = direction === "rtl" ? group?.prefixWidth : group?.suffixWidth;
    return (
      <Input
        {...props}
        ref={ref}
        disabled={disabled ?? group?.isDisabled}
        style={mergeStyle(
          {
            paddingLeft: left ? `${left * 2}rpx` : undefined,
            paddingRight: right ? `${right * 2}rpx` : undefined,
          },
          style
        )}
      />
    );
  }
);
