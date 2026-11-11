import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import {
  Children,
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useId,
} from "react";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { useElementLayout } from "../hooks/use-element-layout";
import { createObservableNumber } from "./observable-number";
import type { ObservableNumber } from "./observable-number";
import { scrollContentStyle } from "./scroll-content-style";

export interface ScrollProgressValue {
  offset: ObservableNumber;
  viewport: ObservableNumber;
  content: ObservableNumber;
  top: ObservableNumber;
}
const ScrollProgressContext = createContext<ScrollProgressValue | null>(null);
export const useScrollProgress = () => useContext(ScrollProgressContext);
export interface ScrollProgressProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
  overlay?: ReactNode;
}
export const ScrollProgress = ({
  children,
  orientation = "vertical",
  overlay,
  ...props
}: ScrollProgressProps) => {
  const horizontal = orientation === "horizontal";
  const child = Children.only(children) as ReactElement<
    ComponentProps<typeof ScrollView>
  >;
  const measurement = useElementLayout(
    true,
    child.props.children,
    child.props.id
  );
  const contentId = `panelui-scroll-content-${useId().replaceAll(":", "")}`;
  const contentMeasurement = useElementLayout(
    child.type === ScrollView,
    child.props.children,
    contentId
  );
  const value = useMemo<ScrollProgressValue>(
    () => ({
      content: createObservableNumber(),
      offset: createObservableNumber(),
      top: createObservableNumber(),
      viewport: createObservableNumber(),
    }),
    []
  );
  useEffect(() => {
    if (measurement.layout) {
      value.viewport.value = horizontal
        ? measurement.layout.width
        : measurement.layout.height;
      value.top.value = measurement.layout.top;
    }
  }, [measurement.layout, value, horizontal]);
  useEffect(() => {
    if (contentMeasurement.layout) {
      value.content.value = horizontal
        ? contentMeasurement.layout.width
        : contentMeasurement.layout.height;
    }
  }, [contentMeasurement.layout, value, horizontal]);
  const onScroll: NonNullable<ComponentProps<typeof ScrollView>["onScroll"]> = (
    event
  ) => {
    const scale = 375 / getWindowInfo().windowWidth;
    value.offset.value =
      (horizontal ? event.detail.scrollLeft : event.detail.scrollTop) * scale;
    value.content.value =
      (horizontal ? event.detail.scrollWidth : event.detail.scrollHeight) *
      scale;
    child.props.onScroll?.(event);
  };
  return (
    <ScrollProgressContext.Provider value={value}>
      <View {...props}>
        {cloneElement(
          child,
          { id: measurement.id, onScroll },
          child.type === ScrollView ? (
            <View
              id={contentId}
              style={scrollContentStyle(
                child.props.enableFlex,
                horizontal,
                measurement.layout?.[horizontal ? "width" : "height"] ?? 0
              )}
            >
              {child.props.children}
            </View>
          ) : (
            child.props.children
          )
        )}
        {overlay}
      </View>
    </ScrollProgressContext.Provider>
  );
};
