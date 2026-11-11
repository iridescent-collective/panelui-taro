import { useCallback, useEffect, useState } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { TourBackdrop } from "./backdrop";
import { TourCard } from "./card";
import {
  currentTourCardHeight,
  nextTourCardMeasurement,
} from "./card-measurement";
import type { TourCardMeasurement } from "./card-measurement";
import { cardFrame, spotlightFor } from "./geometry";
import { TourSpotlight } from "./spotlight";
import type { TourOverlayProps, TourRect } from "./types";

export const TourOverlay = (props: TourOverlayProps) => {
  const {
    active,
    padding,
    radius,
    shape,
    placement,
    interactive,
    dismissible,
    overlayColor,
    onSkip,
  } = props;
  const { width, height, insets } = useWindowMetrics();
  const [spot, setSpot] = useState<
    | (TourRect & {
        radius: number;
      })
    | null
  >(null);
  const [measurement, setMeasurement] = useState<TourCardMeasurement | null>(
    null
  );
  const cardHeight = currentTourCardHeight(active, measurement);
  const stepPadding = active?.padding ?? padding;
  const stepRadius = active?.radius ?? radius;
  const stepShape = active?.shape ?? shape;
  useEffect(() => {
    if (!active) {
      setSpot(null);
      return;
    }
    let cancelled = false;
    active.measure((rect) => {
      if (cancelled) {
        return;
      }
      if (!rect) {
        setSpot(null);
        return;
      }
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      setSpot(spotlightFor(rect, stepShape, stepPadding, stepRadius));
    });
    return () => {
      cancelled = true;
    };
  }, [active, stepShape, stepPadding, stepRadius, width, height]);
  const frame = cardFrame({
    cardHeight,
    insets,
    placement: active?.placement ?? placement,
    screenHeight: height,
    screenWidth: width,
    spot,
  });
  const onMeasure = useCallback(
    (value: number) =>
      setMeasurement((current) =>
        nextTourCardMeasurement(active, value, current)
      ),
    [active]
  );
  return (
    <>
      <TourBackdrop
        interactive={interactive}
        dismissible={dismissible}
        spot={spot}
        width={width}
        height={height}
        onDismiss={onSkip}
      />
      <TourSpotlight
        spot={spot}
        width={width}
        height={height}
        color={overlayColor}
      />
      <TourCard
        key={active?.order ?? "none"}
        props={props}
        frame={frame}
        height={cardHeight}
        onMeasure={onMeasure}
      />
    </>
  );
};
