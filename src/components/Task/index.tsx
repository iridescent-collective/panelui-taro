import { View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { TaskContext } from "./context";
import { TaskContent, TaskItem, TaskFile } from "./parts";
import { TaskTrigger } from "./trigger";
import type { TaskProps } from "./types";
import { taskVariants } from "./variants";

export type {
  TaskProps,
  TaskTriggerProps,
  TaskContentProps,
  TaskItemProps,
  TaskFileProps,
  TaskStatus,
} from "./types";
const TaskRoot = ({
  className,
  status = "complete",
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: TaskProps) => {
  const state = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const context = useMemo(
    () => ({ open: state.value, setOpen: state.setValue, status }),
    [status, state.value, state.setValue]
  );
  return (
    <TaskContext.Provider value={context}>
      <View
        {...props}
        className={cn(
          taskVariants({ status }).root(),
          "flex flex-col",
          className
        )}
      >
        {children}
      </View>
    </TaskContext.Provider>
  );
};
export const Task = Object.assign(TaskRoot, {
  Content: TaskContent,
  File: TaskFile,
  Item: TaskItem,
  Trigger: TaskTrigger,
});
