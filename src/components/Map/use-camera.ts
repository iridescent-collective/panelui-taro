import { createMapContext, getCurrentInstance, nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import {
  mapViewMatches,
  stableMapBounds,
  startCameraCompletion,
} from "./camera-completion";
import { gcj02ToWgs84, wgs84ToGcj02 } from "./coordinates";
import { resolveNativeMapScope } from "./native-scope";
import { projectMapRegion } from "./region-projection";
import type { NativeMapProjectionFrame } from "./region-projection";
import type {
  CameraOptions,
  CameraAnimationOptions,
  CameraRef,
  LngLat,
  LngLatBounds,
  MapAdapterIssue,
  MapProps,
  MapRef,
  PixelPoint,
  ViewState,
} from "./types";

export const clampMapZoom = (value: number) => Math.min(20, Math.max(3, value));
const nativeCommandZoom = (value: number, platform: string) => {
  const zoom = clampMapZoom(value);
  return platform === "devtools" ? Math.floor(zoom) : zoom;
};
export const viewPadding = (value: number | CameraOptions["padding"]) =>
  typeof value === "number"
    ? { bottom: value, left: value, right: value, top: value }
    : (value ?? {});
export const useMapCamera = (
  id: string,
  settings: MapProps,
  issue: (value: MapAdapterIssue) => void,
  size: { width: number; height: number }
) => {
  const coordinateSystem = settings.coordinateSystem ?? "wgs84";
  const { scale, platform } = useWindowMetrics();
  const viewStateChange = useRef(settings.onViewStateChange);
  viewStateChange.current = settings.onViewStateChange;
  const dimensions = useRef(size);
  dimensions.current = size;
  const regionProjection = useRef<{
    revision: number;
    width: number;
    height: number;
    owner: ReturnType<typeof createMapContext>;
    snapshot: Promise<NativeMapProjectionFrame>;
  } | null>(null);
  const [scope] = useState(() => getCurrentInstance().page);
  const initial = useRef({
    bearing: settings.bearing ?? 0,
    bounds: settings.bounds,
    center: settings.center ?? ([0, 20] as LngLat),
    pitch: settings.pitch ?? 0,
    zoom: settings.zoom ?? 2,
  }).current;
  const [frame, setFrame] = useState({
    bearing: initial.bearing,
    center: initial.center,
    pitch: Math.min(40, Math.max(0, initial.pitch)),
    zoom: nativeCommandZoom(initial.zoom, platform),
  });
  const current = useRef(frame);
  const nativeRef = useRef<ReturnType<typeof createMapContext> | null>(null);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const projectionRevision = useRef(revision);
  projectionRevision.current = revision;
  const readyRef = useRef(false);
  const mounted = useRef(true);
  const toNative = useCallback(
    (point: LngLat) =>
      coordinateSystem === "wgs84"
        ? wgs84ToGcj02(point)
        : ([...point] as LngLat),
    [coordinateSystem]
  );
  const fromNative = useCallback(
    (point: LngLat) =>
      coordinateSystem === "wgs84"
        ? gcj02ToWgs84(point)
        : ([...point] as LngLat),
    [coordinateSystem]
  );
  const [state, setState] = useState<ViewState>({
    ...frame,
    bounds: [-180, -85, 180, 85],
  });
  const readVersion = useRef(0);
  const operationVersion = useRef(0);
  const animation = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settlement = useRef<(() => void) | null>(null);
  const nativeFitPending = useRef(false);
  const invalidateReads = useCallback(() => {
    nativeFitPending.current = false;
    readVersion.current += 1;
    operationVersion.current += 1;
  }, []);
  const read = useCallback(async (): Promise<ViewState> => {
    const native = nativeRef.current;
    if (!native) {
      throw new Error("Map: native map context is not ready");
    }
    const [center, zoom, bearing, pitch, region] = await Promise.all([
      native.getCenterLocation(),
      native.getScale(),
      native.getRotate(),
      native.getSkew(),
      native.getRegion(),
    ]);
    const southwest = fromNative([
      region.southwest.longitude,
      region.southwest.latitude,
    ]);
    const northeast = fromNative([
      region.northeast.longitude,
      region.northeast.latitude,
    ]);
    return {
      bearing: bearing.rotate,
      bounds: [southwest[0], southwest[1], northeast[0], northeast[1]],
      center: fromNative([center.longitude, center.latitude]),
      pitch: pitch.skew,
      zoom: zoom.scale,
    };
  }, [fromNative]);
  const refresh = useCallback(
    async (
      synchronizeCurrent = false,
      reportFailure = true,
      isCurrent?: () => boolean
    ) => {
      readVersion.current += 1;
      const request = readVersion.current;
      const operation = operationVersion.current;
      const canPublish = () =>
        mounted.current &&
        request === readVersion.current &&
        operation === operationVersion.current &&
        (isCurrent?.() ?? true);
      try {
        const next = await read();
        if (canPublish()) {
          const frame$ = {
            bearing: next.bearing,
            center: next.center,
            pitch: next.pitch,
            zoom: next.zoom,
          };
          if (synchronizeCurrent && animation.current === null) {
            current.current = frame$;
          }
          setState(next);
          setRevision((value) => value + 1);
          viewStateChange.current?.(next);
          return next;
        }
      } catch (error) {
        if (reportFailure && canPublish()) {
          issue({
            capability: "camera-state",
            message:
              error instanceof Error
                ? error.message
                : "Could not read native camera",
          });
        }
      }
    },
    [read, issue]
  );
  const project = useCallback(
    async (point: LngLat): Promise<PixelPoint> => {
      const native = nativeRef.current;
      if (!native) {
        throw new Error("Map: native coordinate projection is unavailable");
      }
      const [longitude, latitude] = toNative(point);
      if (platform === "devtools") {
        let cached = regionProjection.current;
        if (
          !cached ||
          cached.revision !== projectionRevision.current ||
          cached.owner !== native ||
          cached.width !== dimensions.current.width ||
          cached.height !== dimensions.current.height
        ) {
          const snapshot = (async () => {
            const [region, bearing, pitch] = await Promise.all([
              native.getRegion(),
              native.getRotate(),
              native.getSkew(),
            ]);
            return { bearing: bearing.rotate, pitch: pitch.skew, region };
          })();
          cached = {
            height: dimensions.current.height,
            owner: native,
            revision: projectionRevision.current,
            snapshot,
            width: dimensions.current.width,
          };
          regionProjection.current = cached;
        }
        return projectMapRegion(
          [longitude, latitude],
          await cached.snapshot,
          dimensions.current.width,
          dimensions.current.height
        );
      }
      const result = await native.toScreenLocation({ latitude, longitude });
      if (
        !("x" in result) ||
        !("y" in result) ||
        typeof result.x !== "number" ||
        typeof result.y !== "number"
      ) {
        throw new Error(
          "Map: native coordinate projection returned no screen point"
        );
      }
      return [result.x * scale, result.y * scale];
    },
    [toNative, scale, platform]
  );
  const stop = useCallback(() => {
    settlement.current?.();
    settlement.current = null;
    if (animation.current !== null) {
      clearTimeout(animation.current);
      animation.current = null;
    }
  }, []);
  const move = useCallback(
    (
      options: {
        center?: LngLat;
      } & CameraOptions &
        CameraAnimationOptions
    ) => {
      if (
        options.duration !== undefined &&
        !Number.isFinite(options.duration)
      ) {
        throw new RangeError("Map: duration must be finite");
      }
      invalidateReads();
      stop();
      const from = current.current;
      const target = {
        bearing: options.bearing ?? from.bearing,
        center: options.center ?? from.center,
        pitch: Math.min(40, Math.max(0, options.pitch ?? from.pitch)),
        zoom: nativeCommandZoom(options.zoom ?? from.zoom, platform),
      };
      const duration =
        platform === "devtools" ? 0 : Math.max(0, options.duration ?? 0);
      const operation = operationVersion.current;
      const start = Date.now();
      const paint = () => {
        if (!mounted.current) {
          return;
        }
        const progress = duration
          ? Math.min(1, (Date.now() - start) / duration)
          : 1;
        const t =
          options.easing === "linear"
            ? progress
            : progress * progress * (3 - 2 * progress);
        const blend = (a: number, b: number) => a + (b - a) * t;
        const value = {
          bearing: blend(from.bearing, target.bearing),
          center: [
            blend(from.center[0], target.center[0]),
            blend(from.center[1], target.center[1]),
          ] as LngLat,
          pitch: blend(from.pitch, target.pitch),
          zoom: nativeCommandZoom(blend(from.zoom, target.zoom), platform),
        };
        current.current = value;
        setFrame(value);
        setRevision((value$) => value$ + 1);
        if (progress < 1) {
          animation.current = setTimeout(paint, 32);
        } else {
          animation.current = null;
          nextTick(() => {
            if (!mounted.current || operation !== operationVersion.current) {
              return;
            }
            settlement.current = startCameraCompletion({
              accept: (next) => mapViewMatches(next, target),
              isCurrent: () =>
                mounted.current && operation === operationVersion.current,
              read: (isCurrent) => refresh(false, false, isCurrent),
              timeout: () =>
                issue({
                  capability: "camera-state",
                  message:
                    "Native map camera did not settle at the requested view",
                }),
            });
          });
        }
      };
      paint();
    },
    [stop, refresh, invalidateReads, issue, platform]
  );
  const fitBounds = useCallback(
    (box: LngLatBounds, options?: CameraOptions & CameraAnimationOptions) => {
      if (
        options?.duration !== undefined &&
        !Number.isFinite(options.duration)
      ) {
        throw new RangeError("Map: duration must be finite");
      }
      invalidateReads();
      const operation = operationVersion.current;
      const native = nativeRef.current;
      if (!native) {
        return;
      }
      if (options?.duration) {
        issue({
          capability: "fit-bounds-duration",
          message:
            "WeChat includePoints controls its own camera transition; fitBounds duration cannot be configured.",
        });
      }
      const padding = viewPadding(options?.padding);
      const points = [
        [box[0], box[1]],
        [box[0], box[3]],
        [box[2], box[1]],
        [box[2], box[3]],
      ].map((point) => {
        const [longitude, latitude] = toNative(point as LngLat);
        return { latitude, longitude };
      });
      stop();
      nativeFitPending.current = true;
      let fitting = true;
      let acknowledged = false;
      const acceptsBounds = stableMapBounds(
        box,
        () => ({
          height: dimensions.current.height / scale,
          width: dimensions.current.width / scale,
        }),
        toNative
      );
      const isCurrent = () =>
        fitting && mounted.current && operation === operationVersion.current;
      settlement.current = startCameraCompletion({
        accept: (next) => acknowledged && acceptsBounds(next),
        complete: (next) => {
          fitting = false;
          nativeFitPending.current = false;
          const nextFrame = {
            bearing: next.bearing,
            center: next.center,
            pitch: next.pitch,
            zoom: next.zoom,
          };
          current.current = nextFrame;
          setRevision((value) => value + 1);
        },
        isCurrent,
        read: (active) => refresh(false, false, active),
        timeout: () => {
          fitting = false;
          nativeFitPending.current = false;
          issue({
            capability: "fit-bounds",
            message:
              "Native map camera did not settle within the requested bounds",
          });
        },
      });
      const fit = async () => {
        try {
          await native.includePoints({
            padding: [
              padding.top ?? 0,
              padding.right ?? 0,
              padding.bottom ?? 0,
              padding.left ?? 0,
            ].map((value) => value / scale),
            points,
          });
          if (isCurrent()) {
            acknowledged = true;
          }
        } catch (error) {
          if (!isCurrent()) {
            return;
          }
          fitting = false;
          stop();
          nativeFitPending.current = false;
          issue({
            capability: "fit-bounds",
            message:
              error instanceof Error
                ? error.message
                : "Native fitBounds failed",
          });
        }
      };
      void fit();
    },
    [toNative, scale, issue, stop, invalidateReads, refresh]
  );
  const recenter = useCallback(
    (duration = 600) => {
      if (initial.bounds) {
        fitBounds(initial.bounds);
      } else {
        move({ ...initial, duration, easing: "fly" });
      }
    },
    [initial, fitBounds, move]
  );
  const mapRef = useRef<MapRef | null>(null);
  const requireNative = () => {
    const value = nativeRef.current;
    if (!value) {
      throw new Error("Map: native map context is not ready");
    }
    return value;
  };
  mapRef.current = {
    getBearing: async () => {
      const value = await requireNative().getRotate();
      return value.rotate;
    },
    getBounds: async () => {
      const value = await requireNative().getRegion();
      const southwest = fromNative([
        value.southwest.longitude,
        value.southwest.latitude,
      ]);
      const northeast = fromNative([
        value.northeast.longitude,
        value.northeast.latitude,
      ]);
      return [southwest[0], southwest[1], northeast[0], northeast[1]];
    },
    getCenter: async () => {
      const value = await requireNative().getCenterLocation();
      return fromNative([value.longitude, value.latitude]);
    },
    getPitch: async () => {
      const value = await requireNative().getSkew();
      return value.skew;
    },
    getViewState: read,
    getZoom: async () => {
      const value = await requireNative().getScale();
      return value.scale;
    },
  };
  const cameraRef = useRef<CameraRef | null>(null);
  cameraRef.current = {
    easeTo: move,
    fitBounds,
    flyTo: (options) => move({ ...options, easing: "fly" }),
    jumpTo: (options) => move({ ...options, duration: 0 }),
  };
  const updated = () => {
    if (readyRef.current) {
      return;
    }
    nativeRef.current = createMapContext(
      id,
      resolveNativeMapScope(id, scope ?? undefined)
    );
    readyRef.current = true;
    setReady(true);
    settings.onReady?.();
    if (initial.bounds) {
      fitBounds(initial.bounds);
    }
    void refresh(!initial.bounds);
  };
  const tracking = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTracking = () => {
    if (tracking.current !== null) {
      clearTimeout(tracking.current);
      tracking.current = null;
    }
  };
  const regionChanged = (event: {
    type?: unknown;
    causedBy?: unknown;
    detail: unknown;
  }) => {
    const detail =
      event.detail && typeof event.detail === "object" ? event.detail : {};
    const { type: nativeType } = event;
    let type = "type" in detail ? detail.type : undefined;
    if (nativeType === "begin" || nativeType === "end") {
      type = nativeType;
    }
    const detailCause = "causedBy" in detail ? detail.causedBy : undefined;
    const causedBy =
      typeof event.causedBy === "string" ? event.causedBy : detailCause;
    const gesture =
      causedBy === "gesture" || causedBy === "drag" || causedBy === "scale";
    if (type === "begin") {
      if (gesture) {
        invalidateReads();
        stop();
      }
      stopTracking();
      const track = () => {
        if (!mounted.current) {
          return;
        }
        setRevision((value) => value + 1);
        tracking.current = setTimeout(track, 48);
      };
      track();
    } else if (type === "end") {
      stopTracking();
      void refresh(!nativeFitPending.current && gesture);
    }
  };
  useEffect(() => {
    mounted.current = true;
    if (readyRef.current) {
      nativeRef.current = createMapContext(
        id,
        resolveNativeMapScope(id, scope ?? undefined)
      );
      setRevision((value) => value + 1);
    }
    return () => {
      mounted.current = false;
      invalidateReads();
      stop();
      stopTracking();
      nativeRef.current = null;
      mapRef.current = null;
      cameraRef.current = null;
    };
  }, [id, scope, stop, invalidateReads]);
  return {
    cameraRef,
    coordinateSystem,
    frame,
    fromNative,
    mapRef,
    nativeRef,
    project,
    ready,
    recenter,
    refresh,
    regionChanged,
    revision,
    state,
    toNative,
    updated,
  };
};
