import { cn } from "../../lib/utils";
import { Collapse } from "../../primitives/collapse";
import { Text, textChildren } from "../primitives/Text";
import { useReasoning } from "./context";
import type { ReasoningContentProps } from "./types";
import { reasoningVariants } from "./variants";

export const ReasoningContent = ({
  className,
  children,
  ...props
}: ReasoningContentProps) => {
  const { open } = useReasoning("Reasoning.Content");
  const slots = reasoningVariants();
  return (
    <Collapse
      {...props}
      open={open}
      aria-hidden={!open}
      className={cn(slots.content(), "flex flex-col", className)}
    >
      {textChildren(children, (text) => (
        <Text className={slots.contentText()}>{text}</Text>
      ))}
    </Collapse>
  );
};
