import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { textChildren } from "../primitives/Text";
import { InputGroupContext } from "./context";
import { createDecorator } from "./Decorator";
import { InputGroupInput } from "./Field";
import { useInputGroupMeasurements } from "./measurements";
import type { InputGroupProps } from "./types";
import { inputGroupVariants } from "./variants";

export type {
  InputGroupProps,
  InputGroupDecoratorProps,
  InputGroupInputProps,
} from "./types";

const InputGroupRoot = forwardRef<ComponentRef<typeof View>, InputGroupProps>(
  ({ isDisabled = false, children, className, ...props }, ref) => {
    const measurements = useInputGroupMeasurements();
    const value = useMemo(
      () => ({ isDisabled, ...measurements }),
      [isDisabled, measurements]
    );
    const slots = inputGroupVariants();
    return (
      <InputGroupContext.Provider value={value}>
        <View
          {...props}
          ref={ref}
          className={slots.root({ className: `relative ${className ?? ""}` })}
        >
          {textChildren(children)}
        </View>
      </InputGroupContext.Provider>
    );
  }
);
export const InputGroup = Object.assign(InputGroupRoot, {
  Input: InputGroupInput,
  Prefix: createDecorator("prefix"),
  Suffix: createDecorator("suffix"),
});
