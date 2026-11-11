import { View } from "@tarojs/components";
import { useCallback, useEffect, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useTour } from "./context";
import type { TourRect, TourStepProps } from "./types";

export const TourStep = ({
  order,
  title,
  description,
  shape,
  padding,
  radius,
  placement,
  className,
  children,
  ...props
}: TourStepProps) => {
  const { register, unregister } = useTour();
  const measured = useElementLayout(false, children, props.id, false);
  const measure = useCallback(
    (done: (rect: TourRect | null) => void) =>
      measured.refresh(
        () => true,
        (rect) =>
          done(
            rect
              ? {
                  height: rect.height,
                  width: rect.width,
                  x: rect.left,
                  y: rect.top,
                }
              : null
          )
      ),
    [measured.refresh]
  );
  const entry = useMemo(
    () => ({
      description,
      measure,
      order,
      padding,
      placement,
      radius,
      shape,
      title,
    }),
    [order, title, description, shape, padding, radius, placement, measure]
  );
  useEffect(() => {
    register(entry);
    return () => unregister(entry);
  }, [entry, register, unregister]);
  return (
    <View {...props} id={measured.id} className={className}>
      {children}
    </View>
  );
};
TourStep.displayName = "Tour.Step";
