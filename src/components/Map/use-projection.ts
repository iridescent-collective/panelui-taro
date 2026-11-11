import { useEffect, useMemo, useState } from "react";

import { useMap } from "./context";
import type { LngLat, PixelPoint } from "./types";
import { useMapProjectionJob } from "./use-projection-job";

export const useMapPoint = (coordinate: LngLat | undefined) => {
  const ctx = useMap();
  const [point, setPoint] = useState<PixelPoint | null>(null);
  const lng = coordinate?.[0];
  const lat = coordinate?.[1];
  const identity = useMemo(
    () => ({
      height: ctx.height,
      lat,
      lng,
      project: ctx.project,
      width: ctx.width,
    }),
    [lng, lat, ctx.project, ctx.width, ctx.height]
  );
  const enabled =
    ctx.ready &&
    ctx.width > 0 &&
    ctx.height > 0 &&
    lng !== undefined &&
    lat !== undefined;
  useEffect(() => {
    if (!enabled) {
      setPoint(null);
    }
  }, [enabled]);
  useMapProjectionJob({
    enabled,
    fail: (error) => {
      setPoint(null);
      ctx.issue({
        capability: "coordinate-projection",
        message:
          error instanceof Error
            ? error.message
            : "Native map projection failed",
      });
    },
    identity,
    receive: setPoint,
    revision: ctx.revision,
    work: () => ctx.project([lng ?? 0, lat ?? 0]),
  });
  return point;
};
