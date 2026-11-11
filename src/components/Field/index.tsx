import { View } from "@tarojs/components";
import { createContext, forwardRef, useContext, useId, useMemo } from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";

import { Label } from "../Label";
import type { LabelProps } from "../Label";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { Separator } from "../Separator";
import { fieldVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;

interface FieldState {
  invalid: boolean;
  disabled: boolean;
  required: boolean;
  relationshipIds: string[];
}
const FieldContext = createContext<FieldState>({
  disabled: false,
  invalid: false,
  relationshipIds: [],
  required: false,
});
export const useFieldLabelledBy = (): string[] | undefined => {
  const { relationshipIds } = useContext(FieldContext);
  return relationshipIds.length > 0 ? relationshipIds : undefined;
};
export interface FieldProps extends ViewProps {
  className?: string;
  orientation?: "vertical" | "horizontal";
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  children?: ReactNode;
}
const FieldRoot = forwardRef<ComponentRef<typeof View>, FieldProps>(
  (
    {
      className,
      orientation = "vertical",
      invalid = false,
      disabled = false,
      required = false,
      children,
      ...props
    },
    ref
  ) => {
    const { root } = fieldVariants({ disabled, orientation });
    const id = useId().replaceAll(":", "");
    const labelId = `panelui-field-${id}-label`;
    const titleId = `panelui-field-${id}-title`;
    const descriptionId = `panelui-field-${id}-description`;
    const errorId = `panelui-field-${id}-error`;
    const state = useMemo(
      () => ({
        disabled,
        invalid,
        relationshipIds: [labelId, titleId, descriptionId, errorId],
        required,
      }),
      [invalid, disabled, required, labelId, titleId, descriptionId, errorId]
    );
    return (
      <FieldContext.Provider value={state}>
        <View
          ref={ref}
          {...props}
          role="group"
          aria-role="group"
          aria-disabled={disabled}
          className={root({ className: `flex ${className ?? ""}` })}
        >
          {textChildren(children)}
        </View>
      </FieldContext.Provider>
    );
  }
);
FieldRoot.displayName = "Field";
export interface FieldContentProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const FieldContent = forwardRef<ComponentRef<typeof View>, FieldContentProps>(
  ({ className, ...props }, ref) => {
    const { content } = fieldVariants();
    return (
      <View
        ref={ref}
        className={content({ className: `flex flex-col ${className ?? ""}` })}
        {...props}
      />
    );
  }
);
FieldContent.displayName = "Field.Content";
export type FieldLabelProps = LabelProps;
const FieldLabel = forwardRef<ComponentRef<typeof View>, FieldLabelProps>(
  ({ isRequired, isInvalid, isDisabled, id, ...props }, ref) => {
    const ctx = useContext(FieldContext);
    return (
      <Label
        ref={ref}
        isRequired={isRequired ?? ctx.required}
        isInvalid={isInvalid ?? ctx.invalid}
        isDisabled={isDisabled ?? ctx.disabled}
        id={id ?? ctx.relationshipIds[0]}
        {...props}
      />
    );
  }
);
FieldLabel.displayName = "Field.Label";
export interface FieldDescriptionProps extends TextProps {
  className?: string;
}
const FieldDescription = forwardRef<
  ComponentRef<typeof Text>,
  FieldDescriptionProps
>(({ className, id, ...props }, ref) => {
  const { disabled, relationshipIds } = useContext(FieldContext);
  const { description } = fieldVariants({ disabled });
  return (
    <Text
      ref={ref}
      id={id ?? relationshipIds[2]}
      className={description({ className })}
      {...props}
    />
  );
});
FieldDescription.displayName = "Field.Description";
export interface FieldErrorProps extends Omit<ViewProps, "children"> {
  className?: string;
  errors?: (
    | string
    | {
        message?: string;
      }
    | null
    | undefined
  )[];
  children?: ReactNode;
}
const FieldError = forwardRef<ComponentRef<typeof View>, FieldErrorProps>(
  ({ className, errors, children, id, ...props }, ref) => {
    const { relationshipIds } = useContext(FieldContext);
    const messages = useMemo(() => {
      if (!errors) {
        return null;
      }
      const seen = new Set<string>();
      const out: string[] = [];
      for (const item of errors) {
        const message = typeof item === "string" ? item : item?.message;
        if (message && !seen.has(message)) {
          seen.add(message);
          out.push(message);
        }
      }
      return out;
    }, [errors]);
    const hasContent = messages ? messages.length > 0 : !!children;
    if (!hasContent) {
      return null;
    }
    const { error, errorText, bullet, bulletDot } = fieldVariants();
    let content = textChildren(children, (text) => (
      <Text className={errorText()}>{text}</Text>
    ));
    if (messages) {
      content =
        messages.length === 1 ? (
          <Text className={errorText()}>{messages[0]}</Text>
        ) : (
          messages.map((message) => (
            <View key={message} className={bullet()}>
              <Text className={bulletDot()}>•</Text>
              <Text className={errorText()}>{message}</Text>
            </View>
          ))
        );
    }
    return (
      <View
        ref={ref}
        {...props}
        role="alert"
        aria-role="alert"
        aria-live="polite"
        id={id ?? relationshipIds[3]}
        className={error({ className: `flex flex-col ${className ?? ""}` })}
      >
        {content}
      </View>
    );
  }
);
FieldError.displayName = "Field.Error";
export interface FieldSetProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const FieldSet = forwardRef<ComponentRef<typeof View>, FieldSetProps>(
  ({ className, ...props }, ref) => {
    const { set } = fieldVariants();
    return (
      <View
        ref={ref}
        {...props}
        role="group"
        aria-role="group"
        className={set({ className: `flex flex-col ${className ?? ""}` })}
      />
    );
  }
);
FieldSet.displayName = "Field.Set";
export interface FieldLegendProps extends TextProps {
  className?: string;
  variant?: "legend" | "label";
}
const FieldLegend = forwardRef<ComponentRef<typeof Text>, FieldLegendProps>(
  ({ className, variant = "legend", ...props }, ref) => {
    const { legend } = fieldVariants({ legendVariant: variant });
    return (
      <Text
        ref={ref}
        {...props}
        role="heading"
        aria-role="heading"
        className={legend({ className })}
      />
    );
  }
);
FieldLegend.displayName = "Field.Legend";
export interface FieldGroupProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const FieldGroup = forwardRef<ComponentRef<typeof View>, FieldGroupProps>(
  ({ className, ...props }, ref) => {
    const { group } = fieldVariants();
    return (
      <View
        ref={ref}
        className={group({ className: `flex flex-col ${className ?? ""}` })}
        {...props}
      />
    );
  }
);
FieldGroup.displayName = "Field.Group";
export interface FieldSeparatorProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const FieldSeparator = forwardRef<
  ComponentRef<typeof View>,
  FieldSeparatorProps
>(({ className, children, ...props }, ref) => {
  const { separator, separatorLabel } = fieldVariants();
  return (
    <View ref={ref} className={separator({ className })} {...props}>
      <Separator className="flex-1" />
      {children ? (
        <>
          <Text className={separatorLabel()}>{children}</Text>
          <Separator className="flex-1" />
        </>
      ) : null}
    </View>
  );
});
FieldSeparator.displayName = "Field.Separator";
export interface FieldTitleProps extends TextProps {
  className?: string;
}
const FieldTitle = forwardRef<ComponentRef<typeof Text>, FieldTitleProps>(
  ({ className, id, ...props }, ref) => {
    const { title } = fieldVariants();
    const { relationshipIds } = useContext(FieldContext);
    return (
      <Text
        ref={ref}
        id={id ?? relationshipIds[1]}
        className={title({ className })}
        {...props}
      />
    );
  }
);
FieldTitle.displayName = "Field.Title";
export const Field = Object.assign(FieldRoot, {
  Content: FieldContent,
  Description: FieldDescription,
  Error: FieldError,
  Group: FieldGroup,
  Label: FieldLabel,
  Legend: FieldLegend,
  Separator: FieldSeparator,
  Set: FieldSet,
  Title: FieldTitle,
});
