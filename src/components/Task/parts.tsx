import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { Collapse } from "../../primitives/collapse";
import { Text, textChildren } from "../primitives/Text";
import { useTask } from "./context";
import type { TaskContentProps, TaskItemProps, TaskFileProps } from "./types";
import { taskVariants } from "./variants";

export const TaskContent = ({
  className,
  children,
  ...props
}: TaskContentProps) => {
  const { open } = useTask("Task.Content");
  return (
    <Collapse
      {...props}
      open={open}
      aria-hidden={!open}
      className={cn(taskVariants().content(), "flex flex-col", className)}
    >
      {children}
    </Collapse>
  );
};
export const TaskItem = ({ className, children, ...props }: TaskItemProps) => (
  <View
    {...props}
    className={cn("flex flex-row flex-wrap items-center gap-[8px]", className)}
  >
    {textChildren(children, (text) => (
      <Text className={taskVariants().item()}>{text}</Text>
    ))}
  </View>
);
export const TaskFile = ({
  className,
  icon,
  children,
  ...props
}: TaskFileProps) => (
  <View {...props} className={cn(taskVariants().file(), className)}>
    {icon}
    {textChildren(children, (text) => (
      <Text className={taskVariants().fileLabel()}>{text}</Text>
    ))}
  </View>
);
