import { createContext, useContext } from "react";

import type { StepState, StepsOrientation } from "./types";

interface StepsContextValue {
  activeStep: number;
  setActiveStep: (step: number) => void;
  orientation: StepsOrientation;
  separators: boolean;
}
interface StepItemContextValue {
  step: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
}
interface StepPositionContextValue {
  position: number;
  total: number;
}
export const StepsContext = createContext<StepsContextValue | null>(null);
export const StepItemContext = createContext<StepItemContextValue | null>(null);
export const StepPositionContext =
  createContext<StepPositionContextValue | null>(null);
export const useSteps = (component: string): StepsContextValue => {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Steps>`);
  }
  return context;
};
export const useStepItem = (component: string): StepItemContextValue => {
  const context = useContext(StepItemContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Steps.Item>`);
  }
  return context;
};
