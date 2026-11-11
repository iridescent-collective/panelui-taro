import { CustomWrapper, Map as NativeMap, View } from "@tarojs/components";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { CARTO_SOURCE } from "./basemap";
import {
  MapContext,
  MapReserveContext,
  MapReservationsContext,
} from "./context";
import type { AccessibleFeatureGroup, MapDrawing } from "./context";
import { partitionMapChildren } from "./map-children";
import type { MapReservation } from "./map-insets";
import { nativeMapScopeId } from "./native-scope";
import { MapSurface } from "./surface";
import type {
  LngLat,
  MapAdapterIssue,
  MapHandle,
  MapProps,
  PixelPoint,
} from "./types";
import { useMapCamera, viewPadding } from "./use-camera";
import { mapVariants } from "./variants";

export const MapRoot = forwardRef<MapHandle, MapProps>((settings, ref) => {
  const {
    children,
    className,
    center: _center,
    zoom: _zoom,
    bearing: _bearing,
    pitch: _pitch,
    bounds: _bounds,
    blank = false,
    source = CARTO_SOURCE,
    mapStyle,
    rotatable = false,
    interactive = true,
    onViewStateChange: _onViewStateChange,
    onPress,
    onReady: _onReady,
    coordinateSystem: _coordinateSystem,
    nativeStyle,
    onAdapterIssue,
    ...props
  } = settings;
  const layout = useElementLayout(true, "map", undefined, false);
  const nativeId = `${layout.id}-native`;
  const slots = mapVariants();
  const background = useThemeToken("background");
  const [issues, setIssues] = useState<MapAdapterIssue[]>([]);
  const issueHandler = useRef(onAdapterIssue);
  issueHandler.current = onAdapterIssue;
  const issue = useCallback((value: MapAdapterIssue) => {
    setIssues((current) =>
      current.some(
        (entry) =>
          entry.capability === value.capability &&
          entry.message === value.message
      )
        ? current
        : [...current, value]
    );
    issueHandler.current?.(value);
  }, []);
  const camera = useMapCamera(nativeId, settings, issue, {
    height: layout.layout?.height ?? 0,
    width: layout.layout?.width ?? 0,
  });
  const [drawings, setDrawings] = useState<ReadonlyMap<string, MapDrawing>>(
    () => new globalThis.Map()
  );
  const [features, setFeatures] = useState<
    ReadonlyMap<string, AccessibleFeatureGroup>
  >(() => new globalThis.Map());
  const [reservations, setReservations] = useState<
    ReadonlyMap<string, MapReservation>
  >(() => new globalThis.Map());
  const [location, setLocations] = useState<
    ReadonlyMap<
      string,
      {
        heading: boolean;
        accuracy: boolean;
      }
    >
  >(() => new globalThis.Map());
  const taps = useRef(
    new globalThis.Map<string, (point: PixelPoint) => boolean>()
  );
  const registerDrawing = useCallback(
    (id: string, value: MapDrawing | null) =>
      setDrawings((current) => {
        const next = new globalThis.Map(current);
        if (value) {
          next.set(id, value);
        } else {
          next.delete(id);
        }
        return next;
      }),
    []
  );
  const registerAccessibleFeatures = useCallback(
    (id: string, value: AccessibleFeatureGroup | null) =>
      setFeatures((current) => {
        const next = new globalThis.Map(current);
        if (value?.features.length) {
          next.set(id, value);
        } else {
          next.delete(id);
        }
        return next;
      }),
    []
  );
  const reserve = useCallback(
    (id: string, value: MapReservation | null) =>
      setReservations((current) => {
        const held = current.get(id);
        if (
          value
            ? held?.position === value.position && held.extent === value.extent
            : !held
        ) {
          return current;
        }
        const next = new globalThis.Map(current);
        if (value) {
          next.set(id, value);
        } else {
          next.delete(id);
        }
        return next;
      }),
    []
  );
  const registerTap = useCallback(
    (id: string, value: ((point: PixelPoint) => boolean) | null) => {
      if (value) {
        taps.current.set(id, value);
      } else {
        taps.current.delete(id);
      }
    },
    []
  );
  const setLocation = useCallback(
    (
      id: string,
      value: {
        heading: boolean;
        accuracy: boolean;
      } | null
    ) =>
      setLocations((current) => {
        const next = new globalThis.Map(current);
        if (value) {
          next.set(id, value);
        } else {
          next.delete(id);
        }
        return next;
      }),
    []
  );
  useEffect(() => {
    setIssues((current) => {
      const next = current.filter(
        (value) =>
          !(value.capability === "basemap-style" && mapStyle === undefined) &&
          !(value.capability === "basemap-source" && source === CARTO_SOURCE)
      );
      return next.length === current.length ? current : next;
    });
    if (mapStyle !== undefined) {
      issue({
        capability: "basemap-style",
        message:
          "WeChat Map cannot load a MapLibre style document or style URL. Supply nativeStyle with a Tencent subkey/layerStyle.",
      });
    }
    if (source !== CARTO_SOURCE) {
      issue({
        capability: "basemap-source",
        message:
          "WeChat Map cannot load arbitrary vector tiles or glyph endpoints. Its basemap uses Tencent's native tile service.",
      });
    }
  }, [mapStyle, source, issue]);
  useImperativeHandle(
    ref,
    () => ({
      fitBounds: (box, options) => {
        const { padding = 48, duration = 900 } =
          typeof options === "number" ? { padding: options } : (options ?? {});
        camera.cameraRef.current?.fitBounds(box, {
          duration,
          padding: viewPadding(padding),
        });
      },
      flyTo: ({ center: next, zoom: nextZoom, duration = 900 }) =>
        camera.cameraRef.current?.flyTo({
          center: next,
          duration,
          zoom: nextZoom,
        }),
      getViewState: async () =>
        camera.ready
          ? ((await camera.mapRef.current?.getViewState()) ?? null)
          : null,
      recenter: camera.recenter,
    }),
    [camera.cameraRef, camera.mapRef, camera.ready, camera.recenter]
  );
  const ctx = useMemo(
    () => ({
      ...camera,
      height: layout.layout?.height ?? 0,
      issue,
      registerAccessibleFeatures,
      registerDrawing,
      registerTap,
      setLocation,
      width: layout.layout?.width ?? 0,
    }),
    [
      camera.ready,
      camera.revision,
      camera.state,
      camera.project,
      camera.toNative,
      camera.fromNative,
      camera.recenter,
      camera.coordinateSystem,
      issue,
      registerDrawing,
      registerAccessibleFeatures,
      registerTap,
      setLocation,
      layout.layout?.width,
      layout.layout?.height,
    ]
  );
  const nativeCenter = camera.toNative(camera.frame.center);
  const parts = partitionMapChildren(children);
  const tap = async (event: { detail: unknown }) => {
    const value = event.detail;
    if (
      !value ||
      typeof value !== "object" ||
      !("longitude" in value) ||
      !("latitude" in value) ||
      typeof value.longitude !== "number" ||
      typeof value.latitude !== "number"
    ) {
      return;
    }
    const coordinate: LngLat = camera.fromNative([
      value.longitude,
      value.latitude,
    ]);
    try {
      const point = await camera.project(coordinate);
      const handlers = [...taps.current.values()];
      for (let index = handlers.length - 1; index >= 0; index -= 1) {
        const hit = handlers[index];
        if (hit(point)) {
          return;
        }
      }
      onPress?.(coordinate, point);
    } catch (error) {
      issue({
        capability: "map-tap",
        message:
          error instanceof Error ? error.message : "Map tap projection failed",
      });
    }
  };
  return (
    <MapContext.Provider value={ctx}>
      <View
        {...props}
        id={layout.id}
        className={cn("relative min-h-0", slots.root({ className }))}
        style={
          typeof props.style === "string"
            ? `background:${background};${props.style}`
            : { backgroundColor: background, ...props.style }
        }
      >
        <CustomWrapper
          id={nativeMapScopeId(nativeId)}
          className="absolute inset-0 h-full w-full"
        >
          <NativeMap
            id={nativeId}
            latitude={nativeCenter[1]}
            longitude={nativeCenter[0]}
            scale={camera.frame.zoom}
            rotate={camera.frame.bearing}
            skew={camera.frame.pitch}
            enableZoom={interactive}
            enableScroll={interactive}
            enableRotate={rotatable}
            enableOverlooking={rotatable}
            showLocation={location.size > 0}
            showCompass={false}
            showScale={false}
            subkey={nativeStyle?.subkey}
            layerStyle={nativeStyle?.layerStyle}
            className="absolute inset-0 h-full w-full"
            style={{ zIndex: 0, ...(blank ? { opacity: 0 } : {}) }}
            onError={(event) =>
              issue({
                capability: "native-map",
                message:
                  typeof event.detail === "string"
                    ? event.detail
                    : (JSON.stringify(event.detail) ?? "Native map error"),
              })
            }
            onUpdated={camera.updated}
            onRegionChange={camera.regionChanged}
            onTap={(event) => {
              void tap(event);
            }}
          />
        </CustomWrapper>
        <MapSurface drawings={drawings} />
        <View
          className="absolute inset-0"
          style={{ pointerEvents: "none", zIndex: 2 }}
        >
          {parts.layers}
        </View>
        <MapReserveContext.Provider value={reserve}>
          <MapReservationsContext.Provider value={[...reservations.values()]}>
            <View
              className="absolute inset-0"
              style={{ pointerEvents: "none", zIndex: 3 }}
            >
              {textChildren(parts.overlay)}
            </View>
          </MapReservationsContext.Provider>
        </MapReserveContext.Provider>
        <View aria-role="list" className="sr-only">
          {[...features].flatMap(([id, group]) =>
            group.features.map(({ feature, label, hint, state }, index) =>
              group.onPress ? (
                <AnimatedPressable
                  key={`${id}-${index}`}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint={hint}
                  accessibilityState={state}
                  onPress={() => group.onPress?.(feature)}
                />
              ) : (
                <View
                  key={`${id}-${index}`}
                  aria-label={label}
                  aria-description={hint}
                />
              )
            )
          )}
        </View>
        {issues.length ? (
          <View
            aria-role="alert"
            className="absolute top-[24px] right-[24px] left-[24px] rounded-[16px] bg-[var(--panel-card)] p-[16px]"
          >
            {issues.map((entry) => (
              <Text key={`${entry.capability}:${entry.message}`} size="xs">
                {entry.message}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </MapContext.Provider>
  );
});
MapRoot.displayName = "Map";
