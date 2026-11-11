import { createContext, useContext } from "react";

import type { TaskContextValue } from "./types";

export const TaskContext = createContext<TaskContextValue | null>(null);
export const useTask = (component: string) => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Task>`);
  }
  return context;
};
