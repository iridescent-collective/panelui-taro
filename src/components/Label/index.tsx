import { View } from "@tarojs/components";
import { forwardRef, createContext, useContext, useMemo } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";

const LabelContext = createContext({
  isDisabled: false,
  isInvalid: false,
  isRequired: false,
});

export interface LabelProps extends ComponentProps<typeof View> {
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
}
export interface LabelTextProps extends TextProps {
  asteriskClassName?: string;
}

const LabelText = forwardRef<ComponentRef<typeof Text>, LabelTextProps>(
  ({ className, asteriskClassName, ...props }: LabelTextProps, ref) => {
    const { isRequired, isInvalid, isDisabled } = useContext(LabelContext);
    return (
      <>
        <Text
          ref={ref}
          size="sm"
          weight="medium"
          {...props}
          className={cn(
            isInvalid && "text-[color:var(--panel-destructive)]",
            className
          )}
        />
        {isRequired ? (
          <Text
            aria-hidden
            size="sm"
            weight="medium"
            className={cn(
              isDisabled
                ? "text-[color:var(--panel-muted-foreground)]"
                : "text-[color:var(--panel-destructive)]",
              asteriskClassName
            )}
          >
            *
          </Text>
        ) : null}
      </>
    );
  }
);
const LabelRoot = forwardRef<ComponentRef<typeof View>, LabelProps>(
  (
    {
      isRequired = false,
      isInvalid = false,
      isDisabled = false,
      className,
      children,
      ...props
    }: LabelProps,
    ref
  ) => {
    const state = useMemo(
      () => ({ isDisabled, isInvalid, isRequired }),
      [isRequired, isInvalid, isDisabled]
    );
    return (
      <LabelContext.Provider value={state}>
        <View
          ref={ref}
          {...props}
          aria-disabled={isDisabled}
          className={cn(
            "flex flex-row items-center gap-[8px]",
            isDisabled && "opacity-[0.64]",
            className
          )}
        >
          {textChildren(children, (value) => (
            <LabelText>{value}</LabelText>
          ))}
        </View>
      </LabelContext.Provider>
    );
  }
);
export const Label = Object.assign(LabelRoot, { Text: LabelText });
