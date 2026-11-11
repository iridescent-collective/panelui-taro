import {
  cloneElement,
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { ReactNode, ReactElement } from "react";

import type { QuestionnaireContextValue } from "./context";
import {
  QuestionnaireTitle,
  QuestionnaireFooter,
  QuestionnaireItem,
  questionOf,
} from "./parts";
import { QuestionnaireProgress } from "./progress";
import type {
  QuestionnaireItemStatus,
  QuestionnaireAnswers,
  QuestionnaireItemDefinition,
  QuestionnaireProps,
  QuestionnaireItemProps,
  ResolvedItem,
} from "./types";
import { isAnswered } from "./utils";

export const useQuestionnaireModel = ({
  className,
  items,
  item: itemProp,
  defaultItem,
  onItemChange,
  answers: answersProp,
  defaultAnswers,
  onAnswersChange,
  onSubmit,
  shortcuts,
  swipeable = true,
  frame = true,
  children,
  ...props
}: QuestionnaireProps) => {
  const { titleNode, progressNode, footerNode, elements } = useMemo(() => {
    let title: ReactNode = null;
    let progress: ReactNode = null;
    let footer: ReactNode = null;
    const found: ReactElement<QuestionnaireItemProps>[] = [];
    Children.forEach(children, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      if (child.type === QuestionnaireTitle) {
        title = child;
      } else if (child.type === QuestionnaireProgress) {
        progress = child;
      } else if (child.type === QuestionnaireFooter) {
        footer = child;
      } else if (child.type === QuestionnaireItem) {
        found.push(child as ReactElement<QuestionnaireItemProps>);
      }
    });
    return {
      elements: found,
      footerNode: footer,
      progressNode: progress,
      titleNode: title,
    };
  }, [children]);
  const resolved = useMemo<ResolvedItem[]>(() => {
    const byName = new Map(
      elements.map((element) => [element.props.name, element])
    );
    const merge = (
      definition: QuestionnaireItemDefinition,
      element: ReactElement<QuestionnaireItemProps> | undefined
    ): ResolvedItem | null => {
      if (!element) {
        return null;
      }
      const p = element.props;
      return {
        disabled: p.disabled ?? definition.disabled,
        element: cloneElement(element, {
          disabled: p.disabled ?? definition.disabled,
          multiple: p.multiple ?? definition.multiple,
          required: p.required ?? definition.required,
        }),
        multiple: p.multiple ?? definition.multiple,
        name: definition.name,
        onStatusChange: p.onStatusChange,
        required: p.required ?? definition.required,
      };
    };
    if (items?.length) {
      return items
        .map((definition) => merge(definition, byName.get(definition.name)))
        .filter((entry): entry is ResolvedItem => entry !== null);
    }
    return elements.map((element) => ({
      disabled: element.props.disabled,
      element,
      multiple: element.props.multiple,
      name: element.props.name,
      onStatusChange: element.props.onStatusChange,
      required: element.props.required,
    }));
  }, [items, elements]);
  const enabled = useMemo(
    () => resolved.filter((entry) => !entry.disabled),
    [resolved]
  );
  const [internalItem, setInternalItem] = useState<string | null>(
    defaultItem ?? null
  );
  const [internalAnswers, setInternalAnswers] = useState<QuestionnaireAnswers>(
    () => defaultAnswers ?? {}
  );
  const [skipped, setSkipped] = useState<ReadonlySet<string>>(() => new Set());
  const [invalid, setInvalid] = useState<ReadonlySet<string>>(() => new Set());
  const isItemControlled = itemProp !== undefined;
  const isAnswersControlled = answersProp !== undefined;
  const answers = isAnswersControlled ? answersProp : internalAnswers;
  const requested = isItemControlled ? itemProp : internalItem;
  const activeIndex = Math.max(
    0,
    enabled.findIndex((entry) => entry.name === requested)
  );
  const activeItem = enabled[activeIndex] ?? null;
  const activeName = activeItem?.name ?? null;
  const total = enabled.length;
  const current = total === 0 ? 0 : activeIndex + 1;
  const first = activeIndex === 0;
  const last = total === 0 || activeIndex === total - 1;
  const statusOf = useCallback(
    (name: string): QuestionnaireItemStatus => {
      if (isAnswered(answers[name])) {
        return "answered";
      }
      if (skipped.has(name)) {
        return "skipped";
      }
      return "unanswered";
    },
    [answers, skipped]
  );
  const emitStatus = useCallback(
    (name: string, status: QuestionnaireItemStatus) => {
      resolved.find((entry) => entry.name === name)?.onStatusChange?.(status);
    },
    [resolved]
  );
  const commitAnswers = useCallback(
    (next: QuestionnaireAnswers) => {
      if (!isAnswersControlled) {
        setInternalAnswers(next);
      }
      onAnswersChange?.(next);
    },
    [isAnswersControlled, onAnswersChange]
  );
  const setAnswer = useCallback(
    (name: string, value: string | string[] | undefined) => {
      const remaining = Object.entries(answers).filter(([key]) => key !== name);
      const empty =
        value === undefined || (Array.isArray(value) && value.length === 0);
      const next: QuestionnaireAnswers = Object.fromEntries(
        empty ? remaining : [...remaining, [name, value]]
      );
      commitAnswers(next);
      setSkipped((previous) => {
        if (!previous.has(name)) {
          return previous;
        }
        const copy = new Set(previous);
        copy.delete(name);
        return copy;
      });
      setInvalid((previous) => {
        if (!previous.has(name)) {
          return previous;
        }
        const copy = new Set(previous);
        copy.delete(name);
        return copy;
      });
      emitStatus(name, isAnswered(next[name]) ? "answered" : "unanswered");
    },
    [answers, commitAnswers, emitStatus]
  );
  const toggleAnswer = useCallback(
    (name: string, value: string, multiple: boolean) => {
      if (!multiple) {
        setAnswer(name, answers[name] === value ? undefined : value);
        return;
      }
      const currentValue = answers[name];
      const list = Array.isArray(currentValue) ? currentValue : [];
      setAnswer(
        name,
        list.includes(value)
          ? list.filter((entry) => entry !== value)
          : [...list, value]
      );
    },
    [answers, setAnswer]
  );
  const moveTo = useCallback(
    (index: number) => {
      const target = enabled[index];
      if (!target) {
        return;
      }
      if (!isItemControlled) {
        setInternalItem(target.name);
      }
      onItemChange?.(target.name);
    },
    [enabled, isItemControlled, onItemChange]
  );
  const validate = useCallback(
    (entry: ResolvedItem | null): boolean => {
      if (!entry || !entry.required) {
        return true;
      }
      if (isAnswered(answers[entry.name])) {
        return true;
      }
      setInvalid((previous) => new Set(previous).add(entry.name));
      return false;
    },
    [answers]
  );
  const goNext = useCallback(() => {
    if (!validate(activeItem)) {
      return;
    }
    moveTo(activeIndex + 1);
  }, [validate, activeItem, moveTo, activeIndex]);
  const goBack = useCallback(
    () => moveTo(activeIndex - 1),
    [moveTo, activeIndex]
  );
  const skip = useCallback(() => {
    if (!activeItem || activeItem.required) {
      return;
    }
    setAnswer(activeItem.name, undefined);
    setSkipped((previous) => new Set(previous).add(activeItem.name));
    emitStatus(activeItem.name, "skipped");
    if (!last) {
      moveTo(activeIndex + 1);
    }
  }, [activeItem, setAnswer, emitStatus, last, moveTo, activeIndex]);
  const submit = useCallback(() => {
    const failed = enabled.filter(
      (entry) => entry.required && !isAnswered(answers[entry.name])
    );
    if (failed.length > 0) {
      setInvalid((previous) => {
        const copy = new Set(previous);
        for (const entry of failed) {
          copy.add(entry.name);
        }
        return copy;
      });
      const index = enabled.findIndex(
        (entry) => entry.name === failed[0]?.name
      );
      if (index !== activeIndex) {
        moveTo(index);
      }
      return;
    }
    onSubmit?.(answers);
  }, [enabled, answers, activeIndex, moveTo, onSubmit]);
  const blocked =
    !!activeItem?.required && !isAnswered(answers[activeItem.name]);
  const questionOnStrip = frame && !titleNode;
  const stripQuestion = useMemo(
    () => (questionOnStrip ? questionOf(activeItem?.element) : null),
    [questionOnStrip, activeItem]
  );
  const context = useMemo<QuestionnaireContextValue>(
    () => ({
      activeItem,
      activeName,
      answers,
      blocked,
      current,
      first,
      framed: frame,
      goBack,
      goNext,
      invalid,
      last,
      questionOnStrip,
      setAnswer,
      shortcuts: shortcuts ?? null,
      skip,
      statusOf,
      submit,
      toggleAnswer,
      total,
    }),
    [
      current,
      total,
      first,
      last,
      activeName,
      activeItem,
      answers,
      statusOf,
      invalid,
      setAnswer,
      toggleAnswer,
      goNext,
      goBack,
      skip,
      submit,
      shortcuts,
      frame,
      questionOnStrip,
      blocked,
    ]
  );
  return {
    activeIndex,
    activeItem,
    activeName,
    className,
    context,
    first,
    footerNode,
    frame,
    goBack,
    goNext,
    last,
    progressNode,
    stripQuestion,
    swipeable,
    titleNode,
    viewProps: props,
  };
};
