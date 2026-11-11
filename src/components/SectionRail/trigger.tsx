import { Children, isValidElement, useMemo } from "react";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { textChildren } from "../primitives/Text";
import { SectionRailBar } from "./bar";
import { SectionRailBarsContext, useSectionRail } from "./context";
import type { SectionRailTriggerProps, SectionRailBarProps } from "./types";

export const SectionRailTrigger = ({
  className,
  children,
  style,
  ...props
}: SectionRailTriggerProps) => {
  const { open, setOpen, placement } = useSectionRail("SectionRail.Trigger");
  const values = useMemo(
    () =>
      Children.toArray(children).flatMap((child) =>
        isValidElement<SectionRailBarProps>(child) &&
        child.type === SectionRailBar
          ? [child.props.value]
          : []
      ),
    [children]
  );
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel="Sections"
      aria-expanded={open}
      pressScale={1}
      pressOpacity={1}
      hitSlop={10}
      style={
        typeof style === "string"
          ? `pointer-events:auto;${style}`
          : { pointerEvents: "auto", ...style }
      }
      onPress={(event) => {
        props.onClick?.(event);
        setOpen(!open);
      }}
      className={cn(
        "flex flex-col gap-[12px] py-[20px]",
        placement === "right"
          ? "items-end ps-[40px] pe-[16px]"
          : "items-start ps-[16px] pe-[40px]",
        className
      )}
    >
      <SectionRailBarsContext.Provider value={values}>
        {textChildren(children)}
      </SectionRailBarsContext.Provider>
    </AnimatedPressable>
  );
};
