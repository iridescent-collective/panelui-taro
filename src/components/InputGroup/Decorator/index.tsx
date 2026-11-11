import { View } from "@tarojs/components";
import { forwardRef, useLayoutEffect } from "react";
import type { ComponentRef } from "react";

import { useDirection } from "../../../hooks/use-direction";
import { useElementLayout } from "../../../hooks/use-element-layout";
import { mergeStyle } from "../../../lib/styles";
import { textChildren } from "../../primitives/Text";
import { useInputGroup } from "../context";
import { useInputGroupDecoratorMeasurement } from "../measurements";
import type { InputGroupDecoratorSide } from "../measurements";
import type { InputGroupDecoratorProps } from "../types";
import { inputGroupVariants } from "../variants";

export const createDecorator = (side: InputGroupDecoratorSide) => {
  const Decorator = forwardRef<
    ComponentRef<typeof View>,
    InputGroupDecoratorProps
  >(({ isDecorative = false, children, className, style, ...props }, ref) => {
    const group = useInputGroup();
    const direction = useDirection();
    const layout = useElementLayout(true, children, props.id);
    const measure = useInputGroupDecoratorMeasurement(
      side,
      group?.measureDecorator,
      group?.removeDecorator
    );
    useLayoutEffect(() => {
      if (layout.layout) {
        measure(layout.layout.width);
      }
    }, [layout.layout, measure]);
    const slots = inputGroupVariants({
      isDisabled: group?.isDisabled ?? false,
    });
    const start = side === "prefix";
    const left = start === (direction === "ltr");
    return (
      <View
        {...props}
        ref={ref}
        id={layout.id}
        aria-hidden={isDecorative}
        className={slots[side]({ className })}
        style={mergeStyle(
          {
            [left ? "left" : "right"]: 0,
            pointerEvents: isDecorative ? "none" : "auto",
          },
          style
        )}
      >
        {textChildren(children)}
      </View>
    );
  });
  Decorator.displayName =
    side === "prefix" ? "InputGroup.Prefix" : "InputGroup.Suffix";
  return Decorator;
};
