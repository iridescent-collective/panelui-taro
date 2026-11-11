import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode, ReactElement } from "react";

import type { ButtonProps } from "../Button";
import type { InputProps } from "../Input";
import type { QuestionnaireContextValue } from "./context";

export type QuestionnaireViewProps = ComponentProps<typeof View>;
export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";
export type QuestionnaireShortcutMode = "letters" | "numbers";
export type QuestionnaireAnswers = Record<string, string | string[]>;
export interface QuestionnaireItemDefinition {
  name: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
}
export interface ResolvedItem extends QuestionnaireItemDefinition {
  element: ReactElement<QuestionnaireItemProps>;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
}
export interface QuestionnaireProps extends Omit<
  QuestionnaireViewProps,
  "children"
> {
  className?: string;
  items?: readonly QuestionnaireItemDefinition[];
  item?: string;
  defaultItem?: string;
  onItemChange?: (name: string) => void;
  answers?: QuestionnaireAnswers;
  defaultAnswers?: QuestionnaireAnswers;
  onAnswersChange?: (answers: QuestionnaireAnswers) => void;
  onSubmit?: (answers: QuestionnaireAnswers) => void;
  shortcuts?: QuestionnaireShortcutMode;
  swipeable?: boolean;
  frame?: boolean;
  children?: ReactNode;
}
export interface QuestionnaireBodyProps {
  activeName: string | null;
  activeItem: ResolvedItem | null;
  activeIndex: number;
  framed: boolean;
  swipeable: boolean;
  canAdvance: boolean;
  canRetreat: boolean;
  onNext: () => void;
  onBack: () => void;
}
export interface QuestionnaireTitleProps extends QuestionnaireViewProps {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireProgressState {
  current: number;
  total: number;
  first: boolean;
  last: boolean;
}
export type QuestionnaireProgressVariant =
  | "ring"
  | "pips"
  | "numbers"
  | "count";
export interface QuestionnaireProgressProps {
  className?: string;
  variant?: QuestionnaireProgressVariant;
  children?: ReactNode | ((state: QuestionnaireProgressState) => ReactNode);
}
export interface QuestionnaireItemProps extends Omit<
  QuestionnaireViewProps,
  "children"
> {
  className?: string;
  name: string;
  required?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  onStatusChange?: (status: QuestionnaireItemStatus) => void;
  children?: ReactNode;
}
export interface QuestionnaireQuestionProps extends QuestionnaireViewProps {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireDescriptionProps extends QuestionnaireViewProps {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireChoicesProps extends Omit<
  QuestionnaireViewProps,
  "children"
> {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireChoiceProps {
  className?: string;
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  children?: ReactNode;
}
export interface QuestionnaireInputProps extends Omit<
  InputProps,
  "value" | "onChangeText" | "errorMessage"
> {
  className?: string;
}
export interface QuestionnaireErrorProps extends QuestionnaireViewProps {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireFooterProps extends QuestionnaireViewProps {
  className?: string;
  children?: ReactNode;
}
export interface QuestionnaireActionState {
  visible: boolean;
  status: QuestionnaireItemStatus;
}
export interface QuestionnaireActionProps extends Omit<
  ButtonProps,
  "children"
> {
  children?: ReactNode | ((state: QuestionnaireActionState) => ReactNode);
}
export interface ActionConfig {
  displayName: string;
  label: string;
  variant: NonNullable<ButtonProps["variant"]>;
  startContent?: ReactNode;
  endContent?: ReactNode;
  dimWhenBlocked?: boolean;
  use: (context: QuestionnaireContextValue) => {
    visible: boolean;
    onPress: () => void;
  };
}
