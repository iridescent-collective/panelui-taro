import {
  QuestionnaireBack,
  QuestionnaireSkip,
  QuestionnaireNext,
  QuestionnaireSubmit,
} from "./actions";
import {
  QuestionnaireTitle,
  QuestionnaireItem,
  QuestionnaireQuestion,
  QuestionnaireDescription,
  QuestionnaireChoices,
  QuestionnaireChoice,
  QuestionnaireInput,
  QuestionnaireError,
  QuestionnaireFooter,
  QuestionnaireSpacer,
} from "./parts";
import { QuestionnaireProgress } from "./progress";
import { QuestionnaireRoot } from "./root";

export type {
  QuestionnaireItemStatus,
  QuestionnaireShortcutMode,
  QuestionnaireAnswers,
  QuestionnaireItemDefinition,
  QuestionnaireProps,
  QuestionnaireTitleProps,
  QuestionnaireProgressState,
  QuestionnaireProgressVariant,
  QuestionnaireProgressProps,
  QuestionnaireItemProps,
  QuestionnaireQuestionProps,
  QuestionnaireDescriptionProps,
  QuestionnaireChoicesProps,
  QuestionnaireChoiceProps,
  QuestionnaireInputProps,
  QuestionnaireErrorProps,
  QuestionnaireFooterProps,
  QuestionnaireActionState,
  QuestionnaireActionProps,
} from "./types";
export const Questionnaire = Object.assign(QuestionnaireRoot, {
  Back: QuestionnaireBack,
  Choice: QuestionnaireChoice,
  Choices: QuestionnaireChoices,
  Description: QuestionnaireDescription,
  Error: QuestionnaireError,
  Footer: QuestionnaireFooter,
  Input: QuestionnaireInput,
  Item: QuestionnaireItem,
  Next: QuestionnaireNext,
  Progress: QuestionnaireProgress,
  Question: QuestionnaireQuestion,
  Skip: QuestionnaireSkip,
  Spacer: QuestionnaireSpacer,
  Submit: QuestionnaireSubmit,
  Title: QuestionnaireTitle,
});
