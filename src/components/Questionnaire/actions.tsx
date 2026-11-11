import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { DEFAULT_ERROR } from "./constants";
import { useQuestionnaire } from "./context";
import type { QuestionnaireActionProps, ActionConfig } from "./types";

export const createAction = ({
  displayName,
  label: fallbackLabel,
  variant: fallbackVariant,
  startContent,
  endContent,
  dimWhenBlocked,
  use,
}: ActionConfig) => {
  const Action = ({
    children,
    variant,
    className,
    onClick,
    onPress: callerPress,
    ...props
  }: QuestionnaireActionProps) => {
    const context = useQuestionnaire(displayName);
    const { visible, onPress } = use(context);
    const status = context.activeName
      ? context.statusOf(context.activeName)
      : "unanswered";
    if (!visible) {
      return null;
    }
    const label =
      typeof children === "function" ? children({ status, visible }) : children;
    const dimmed = !!dimWhenBlocked && context.blocked;
    return (
      <Button
        variant={variant ?? fallbackVariant}
        startContent={startContent}
        endContent={endContent}
        onClick={(event) => {
          onClick?.(event);
          callerPress?.(event);
          onPress();
        }}
        aria-label={dimmed ? `${fallbackLabel}. ${DEFAULT_ERROR}` : undefined}
        className={cn(dimmed && "opacity-[0.64]", className)}
        {...props}
      >
        {label ?? fallbackLabel}
      </Button>
    );
  };
  Action.displayName = displayName;
  return Action;
};
export const QuestionnaireBack = createAction({
  displayName: "Questionnaire.Back",
  label: "Back",
  startContent: <ChevronLeftIcon size={16} />,
  use: (context) => ({ onPress: context.goBack, visible: !context.first }),
  variant: "ghost",
});
export const QuestionnaireSkip = createAction({
  displayName: "Questionnaire.Skip",
  label: "Skip",
  use: (context) => ({
    onPress: context.skip,
    visible: !!context.activeItem && !context.activeItem.required,
  }),
  variant: "ghost",
});
export const QuestionnaireNext = createAction({
  dimWhenBlocked: true,
  displayName: "Questionnaire.Next",
  endContent: <ChevronRightIcon size={16} />,
  label: "Continue",
  use: (context) => ({ onPress: context.goNext, visible: !context.last }),
  variant: "primary",
});
export const QuestionnaireSubmit = createAction({
  dimWhenBlocked: true,
  displayName: "Questionnaire.Submit",
  label: "Submit",
  use: (context) => ({ onPress: context.submit, visible: context.last }),
  variant: "primary",
});
