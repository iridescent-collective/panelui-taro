import { useCallback, useEffect, useMemo, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { TOUR_LABELS } from "./constants";
import type { TourProps, TourStepEntry } from "./types";

export const useTourModel = (props: TourProps) => {
  const {
    open,
    defaultOpen = false,
    onOpenChange,
    step,
    defaultStep,
    onStepChange,
    onFinish,
    onSkip,
    dismissible = true,
  } = props;
  const [steps, setSteps] = useState<TourStepEntry[]>([]);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalStep, setInternalStep] = useState<number | null>(
    defaultStep ?? null
  );
  const resolvedOpen = open ?? internalOpen;
  const activeOrder = step ?? internalStep ?? steps[0]?.order ?? null;
  const index = steps.findIndex((entry) => entry.order === activeOrder);
  const active = index === -1 ? undefined : steps[index];
  const register = useCallback((entry: TourStepEntry) => {
    setSteps((current) => {
      const next = current.filter((other) => other.order !== entry.order);
      const at = next.findIndex((other) => other.order > entry.order);
      if (at === -1) {
        next.push(entry);
      } else {
        next.splice(at, 0, entry);
      }
      return next;
    });
  }, []);
  const unregister = useCallback(
    (entry: TourStepEntry) =>
      setSteps((current) => current.filter((other) => other !== entry)),
    []
  );
  const context = useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  );
  const setOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };
  const goTo = (order: number) => {
    onStepChange?.(order);
    if (step === undefined) {
      setInternalStep(order);
    }
  };
  useEffect(() => {
    if (resolvedOpen && step === undefined) {
      setInternalStep(defaultStep ?? null);
    }
  }, [resolvedOpen]);
  const finish = () => {
    setOpen(false);
    onFinish?.();
  };
  const skip = () => {
    setOpen(false);
    onSkip?.();
  };
  const next = () => {
    const following = steps[index + 1];
    if (following) {
      goTo(following.order);
    } else {
      finish();
    }
  };
  const back = () => {
    const previous = steps[index - 1];
    if (previous) {
      goTo(previous.order);
    }
  };
  useBackHandler(resolvedOpen && dismissible, skip);
  return {
    active,
    back,
    context,
    index,
    isFirst: index <= 0,
    isLast: index === steps.length - 1,
    next,
    resolvedOpen,
    skip,
    steps,
    words: { ...TOUR_LABELS, ...props.labels },
  };
};
