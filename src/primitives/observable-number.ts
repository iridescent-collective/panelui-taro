import { createObservableValue } from "./observable-value";
import type { ObservableValue } from "./observable-value";

export type ObservableNumber = ObservableValue<number>;
export const createObservableNumber = (initial = 0): ObservableNumber =>
  createObservableValue(initial);
