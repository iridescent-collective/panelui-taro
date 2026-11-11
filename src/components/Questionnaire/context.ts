import { createContext, useContext } from "react";

import type {
  ResolvedItem,
  QuestionnaireAnswers,
  QuestionnaireItemStatus,
  QuestionnaireShortcutMode,
} from "./types";

export interface QuestionnaireContextValue {
  current: number;
  total: number;
  first: boolean;
  last: boolean;
  activeName: string | null;
  activeItem: ResolvedItem | null;
  answers: QuestionnaireAnswers;
  statusOf: (name: string) => QuestionnaireItemStatus;
  invalid: ReadonlySet<string>;
  setAnswer: (name: string, value: string | string[] | undefined) => void;
  toggleAnswer: (name: string, value: string, multiple: boolean) => void;
  goNext: () => void;
  goBack: () => void;
  skip: () => void;
  submit: () => void;
  shortcuts: QuestionnaireShortcutMode | null;
  framed: boolean;
  questionOnStrip: boolean;
  blocked: boolean;
}
export const QuestionnaireContext =
  createContext<QuestionnaireContextValue | null>(null);
export const useQuestionnaire = (
  component: string
): QuestionnaireContextValue => {
  const context = useContext(QuestionnaireContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Questionnaire>`);
  }
  return context;
};
export interface QuestionnaireItemContextValue {
  name: string;
  required: boolean;
  multiple: boolean;
  invalid: boolean;
  choiceValues: ReadonlySet<string>;
}
export const QuestionnaireItemContext =
  createContext<QuestionnaireItemContextValue | null>(null);
export const useQuestionnaireItem = (
  component: string
): QuestionnaireItemContextValue => {
  const context = useContext(QuestionnaireItemContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Questionnaire.Item>`);
  }
  return context;
};
export const ShortcutContext = createContext<string | null>(null);
