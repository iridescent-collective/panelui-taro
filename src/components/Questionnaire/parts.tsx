import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { ComponentRef, ReactNode, ReactElement } from "react";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable as Pressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Input } from "../Input";
import { Text, textChildren } from "../primitives/Text";
import { QuestionnaireBack, QuestionnaireSkip } from "./actions";
import { choiceVariants } from "./choice-variants";
import { DEFAULT_ERROR } from "./constants";
import {
  useQuestionnaire,
  useQuestionnaireItem,
  QuestionnaireItemContext,
  ShortcutContext,
} from "./context";
import type { QuestionnaireItemContextValue } from "./context";
import type {
  QuestionnaireItemProps,
  QuestionnaireChoiceProps,
  QuestionnaireFooterProps,
  QuestionnaireQuestionProps,
  QuestionnaireActionProps,
  QuestionnaireTitleProps,
  QuestionnaireDescriptionProps,
  QuestionnaireChoicesProps,
  QuestionnaireInputProps,
  QuestionnaireErrorProps,
  QuestionnaireViewProps,
} from "./types";
import { useChoiceMark } from "./use-choice-mark";
import { shortcutAt } from "./utils";
import { questionnaireVariants } from "./variants";

export const QuestionnaireSpacer = ({
  className,
  ...props
}: QuestionnaireViewProps) => (
  <View className={cn("flex-1", className)} {...props} />
);
export const QuestionnaireQuestion = ({
  className,
  children,
  ...props
}: QuestionnaireQuestionProps) => {
  const { questionOnStrip } = useQuestionnaire("Questionnaire.Question");
  if (questionOnStrip) {
    return null;
  }
  return (
    <View className={className} {...props}>
      {textChildren(children, (text) => (
        <Text size="xl" weight="semibold" className="leading-snug text-pretty">
          {text}
        </Text>
      ))}
    </View>
  );
};
export const QuestionnaireChoice = forwardRef<
  ComponentRef<typeof View>,
  QuestionnaireChoiceProps
>(({ className, value, label, description, disabled, children }, ref) => {
  const { answers, toggleAnswer } = useQuestionnaire("Questionnaire.Choice");
  const item = useQuestionnaireItem("Questionnaire.Choice");
  const shortcut = useContext(ShortcutContext);
  const answer = answers[item.name];
  const selected = Array.isArray(answer)
    ? answer.includes(value)
    : answer === value;
  const progress = useChoiceMark(selected);
  const markStyle = { opacity: progress, transform: `scale(${progress})` };
  const checkColor = useThemeToken("primary-foreground");
  const slots = choiceVariants({
    disabled: !!disabled,
    invalid: item.invalid && !selected,
    multiple: item.multiple,
    selected,
  });
  const labelled = label ? (
    <Text className={slots.label()}>{label}</Text>
  ) : (
    textChildren(children, (text) => (
      <Text className={slots.label()}>{text}</Text>
    ))
  );
  return (
    <Pressable
      ref={ref}
      accessibilityRole={item.multiple ? "checkbox" : "radio"}
      accessibilityState={{
        checked: item.multiple ? selected : undefined,
        disabled: !!disabled,
        selected,
      }}
      accessibilityLabel={label}
      accessibilityHint={description}
      disabled={disabled}
      onPress={() => toggleAnswer(item.name, value, item.multiple)}
      className={slots.row({ className })}
    >
      <View
        className={cn(
          slots.indicator({ className: "flex flex-col" }),
          selected && "border-[var(--panel-primary)] bg-[var(--panel-primary)]"
        )}
      >
        <View style={markStyle}>
          {item.multiple ? (
            <CheckIcon
              size={13}
              color={typeof checkColor === "string" ? checkColor : "#fff"}
            />
          ) : (
            <View className="h-[16px] w-[16px] rounded-full bg-[var(--panel-primary-foreground)]" />
          )}
        </View>
      </View>
      <View className="flex min-w-[0px] flex-1 flex-col gap-[8px]">
        {labelled}
        {description ? (
          <Text className={slots.description()}>{description}</Text>
        ) : null}
      </View>
      {shortcut ? (
        <View className={slots.shortcut({ className: "flex flex-col" })}>
          <Text className={slots.shortcutLabel()}>{shortcut}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});
export const bandActions = (footer: ReactNode): ReactNode => {
  if (!isValidElement<QuestionnaireFooterProps>(footer)) {
    return footer;
  }
  return Children.toArray(footer.props.children).flatMap((child) => {
    if (!isValidElement<QuestionnaireActionProps>(child)) {
      return [child];
    }
    if (child.type === QuestionnaireSpacer) {
      return [];
    }
    if (child.type === QuestionnaireBack || child.type === QuestionnaireSkip) {
      return [
        cloneElement(child, {
          className: cn("flex-none", child.props.className),
        }),
      ];
    }
    return [
      cloneElement(child, {
        className: cn("h-auto", child.props.className),
        size: child.props.size ?? "lg",
      }),
    ];
  });
};
export const questionOf = (
  item: ReactElement<QuestionnaireItemProps> | undefined
): ReactNode => {
  if (!item) {
    return null;
  }
  let found: ReactNode = null;
  Children.forEach(item.props.children, (child) => {
    if (found !== null && found !== undefined) {
      return;
    }
    if (!isValidElement<QuestionnaireQuestionProps>(child)) {
      return;
    }
    if (child.type === QuestionnaireQuestion) {
      found = child.props.children;
    }
  });
  return found;
};
export const QuestionnaireTitle = ({
  className,
  children,
  ...props
}: QuestionnaireTitleProps) => (
  <View className={cn("min-w-[0px] flex-1", className)} {...props}>
    {textChildren(children, (text) => (
      <Text size="sm" muted numberOfLines={1}>
        {text}
      </Text>
    ))}
  </View>
);
export const QuestionnaireItem = ({
  className,
  name,
  required,
  multiple,
  invalid: invalidProp,
  children,
  disabled: _disabled,
  onStatusChange: _onStatusChange,
  ...props
}: QuestionnaireItemProps) => {
  const { invalid: invalidNames } = useQuestionnaire("Questionnaire.Item");
  const choiceValues = useMemo(() => {
    const values = new Set<string>();
    const walk = (node: ReactNode) => {
      Children.forEach(node, (child) => {
        if (!isValidElement(child)) {
          return;
        }
        if (child.type === QuestionnaireChoice) {
          values.add((child.props as QuestionnaireChoiceProps).value);
          return;
        }
        walk(
          (
            child.props as {
              children?: ReactNode;
            }
          ).children
        );
      });
    };
    walk(children);
    return values;
  }, [children]);
  const context = useMemo<QuestionnaireItemContextValue>(
    () => ({
      choiceValues,
      invalid: !!invalidProp || invalidNames.has(name),
      multiple: !!multiple,
      name,
      required: !!required,
    }),
    [name, required, multiple, invalidProp, invalidNames, choiceValues]
  );
  return (
    <QuestionnaireItemContext.Provider value={context}>
      <View
        role={multiple ? undefined : "radiogroup"}
        aria-role={multiple ? undefined : "radiogroup"}
        className={cn("flex flex-col gap-[32px]", className)}
        {...props}
      >
        {textChildren(children)}
      </View>
    </QuestionnaireItemContext.Provider>
  );
};
export const QuestionnaireDescription = ({
  className,
  children,
  ...props
}: QuestionnaireDescriptionProps) => (
  <View className={cn("-mt-[20px]", className)} {...props}>
    {textChildren(children, (text) => (
      <Text size="sm" muted className="leading-snug">
        {text}
      </Text>
    ))}
  </View>
);
export const QuestionnaireChoices = ({
  className,
  children,
  ...props
}: QuestionnaireChoicesProps) => {
  const { shortcuts } = useQuestionnaire("Questionnaire.Choices");
  const slots = questionnaireVariants();
  const badged = useMemo(() => {
    if (!shortcuts) {
      return children;
    }
    let index = 0;
    return Children.map(children, (child) => {
      if (!isValidElement(child) || child.type !== QuestionnaireChoice) {
        return child;
      }
      if ((child.props as QuestionnaireChoiceProps).disabled) {
        return child;
      }
      const key = shortcutAt(shortcuts, index);
      index += 1;
      if (!key) {
        return child;
      }
      return (
        <ShortcutContext.Provider key={key} value={key}>
          {child}
        </ShortcutContext.Provider>
      );
    });
  }, [children, shortcuts]);
  return (
    <View
      className={slots.choices({ className: cn("flex flex-col", className) })}
      {...props}
    >
      {textChildren(badged)}
    </View>
  );
};
export const QuestionnaireInput = forwardRef<
  ComponentRef<typeof Input>,
  QuestionnaireInputProps
>(({ className, ...props }, ref) => {
  const { answers, setAnswer } = useQuestionnaire("Questionnaire.Input");
  const item = useQuestionnaireItem("Questionnaire.Input");
  const answer = answers[item.name];
  const freeform = useMemo(() => {
    if (Array.isArray(answer)) {
      return answer.find((entry) => !item.choiceValues.has(entry)) ?? "";
    }
    return typeof answer === "string" && !item.choiceValues.has(answer)
      ? answer
      : "";
  }, [answer, item.choiceValues]);
  const onChangeText = useCallback(
    (text: string) => {
      if (!item.multiple) {
        setAnswer(item.name, text);
        return;
      }
      const list = Array.isArray(answer) ? answer : [];
      const fixed = list.filter((entry) => item.choiceValues.has(entry));
      setAnswer(item.name, text.length > 0 ? [...fixed, text] : fixed);
    },
    [item.multiple, item.name, item.choiceValues, answer, setAnswer]
  );
  return (
    <Input
      ref={ref}
      value={freeform}
      onChangeText={onChangeText}
      className={className}
      {...props}
    />
  );
});
export const QuestionnaireError = ({
  className,
  children,
  ...props
}: QuestionnaireErrorProps) => {
  const item = useQuestionnaireItem("Questionnaire.Error");
  const slots = questionnaireVariants();
  if (!item.invalid) {
    return null;
  }
  return (
    <View
      role="alert"
      aria-role="alert"
      aria-live="polite"
      className={className}
      {...props}
    >
      {textChildren(children ?? DEFAULT_ERROR, (text) => (
        <Text className={slots.error()}>{text}</Text>
      ))}
    </View>
  );
};
export const QuestionnaireFooter = ({
  className,
  children,
  ...props
}: QuestionnaireFooterProps) => {
  const { framed } = useQuestionnaire("Questionnaire.Footer");
  const slots = questionnaireVariants({ framed });
  return (
    <View className={slots.footer({ className })} {...props}>
      {textChildren(children)}
    </View>
  );
};
