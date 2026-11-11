import { View } from "@tarojs/components";
import {
  Children,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
} from "react";

import { CheckIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { Shimmer } from "../Shimmer";
import { PlanStepContext, usePlan } from "./context";
import { STEP_STATUS } from "./status";
import type { PlanStepsProps, PlanStepProps } from "./types";
import { planVariants } from "./variants";

const PlanStepMark = ({
  status,
  onPrimary,
}: {
  status: PlanStepProps["status"];
  onPrimary: string;
}) => {
  if (status === "done") {
    return <CheckIcon size={10} color={onPrimary} />;
  }
  if (status === "active") {
    return (
      <View className="h-[12px] w-[12px] rounded-full bg-[var(--panel-primary)]" />
    );
  }
  return null;
};

export const PlanStep = ({
  className,
  status = "pending",
  description,
  meta,
  last,
  children,
  ...props
}: PlanStepProps) => {
  const { isStreaming } = usePlan("Plan.Step");
  const position = useContext(PlanStepContext);
  const isLast = last ?? position.last;
  const slots = planVariants();
  const tone = STEP_STATUS[status];
  const onPrimary = useThemeToken("primary-foreground");
  const title = slots.stepTitle({ className: tone.title });
  const streamingTitle =
    isStreaming && status === "active" && typeof children === "string";
  return (
    <View
      {...props}
      role="listitem"
      aria-role="listitem"
      className={slots.step({ className })}
    >
      <View
        aria-hidden
        className={cn(slots.stepRail(), "flex shrink-0 flex-col")}
      >
        <View
          className={cn(
            slots.stepMarker({ className: tone.marker }),
            "flex shrink-0"
          )}
        >
          <PlanStepMark status={status} onPrimary={onPrimary} />
        </View>
        {isLast ? null : (
          <View
            data-plan-connector
            className={slots.stepConnector({ className: tone.connector })}
          />
        )}
      </View>
      <View className={cn(slots.stepBody(), "flex flex-col", isLast && "pb-0")}>
        {streamingTitle ? (
          <Shimmer textClassName={title}>{children}</Shimmer>
        ) : (
          textChildren(children, (text) => (
            <Text className={title}>{text}</Text>
          ))
        )}
        {textChildren(description, (text) => (
          <Text className={slots.stepDescription()}>{text}</Text>
        ))}
        {meta === undefined ? null : (
          <View className={slots.stepMeta()}>
            {textChildren(meta, (text) => (
              <Text className="font-mono text-[22px] text-[color:var(--panel-muted-foreground)]">
                {text}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};
export const PlanSteps = ({
  className,
  children,
  ...props
}: PlanStepsProps) => {
  const { reportCounts } = usePlan("Plan.Steps");
  const items = useMemo(
    () => Children.toArray(children).filter((child) => isValidElement(child)),
    [children]
  );
  const counts = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const item of items) {
      if (!isValidElement<PlanStepProps>(item) || item.type !== PlanStep) {
        continue;
      }
      total += 1;
      if (item.props.status === "done" || item.props.status === "skipped") {
        done += 1;
      }
    }
    return { done, total };
  }, [items]);
  useEffect(() => {
    reportCounts(counts);
  }, [counts, reportCounts]);
  return (
    <View
      {...props}
      role="list"
      aria-role="list"
      className={cn(planVariants().steps(), "flex flex-col", className)}
    >
      {items.map((item, index) => (
        <PlanStepContext.Provider
          key={item.key}
          value={{ last: index === items.length - 1 }}
        >
          {item}
        </PlanStepContext.Provider>
      ))}
    </View>
  );
};
