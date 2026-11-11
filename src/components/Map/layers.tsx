import { useEffect, useId, useMemo } from "react";

import { getRegisteredThemeTokens } from "../../theme/registry";
import { useTheme, useThemeToken } from "../../theme/use-theme";
import { arcCoordinates } from "./arc";
import { useMap } from "./context";
import type { MapDrawing } from "./context";
import { describeMapFeatures } from "./map-accessibility";
import { asMapLayer } from "./map-children";
import type {
  MapArcProps,
  MapGeoJSONProps,
  MapHeatmapProps,
  MapRouteProps,
  MapUserLocationProps,
} from "./types";
import { useMapData } from "./use-data";

const useDrawing = (drawing: MapDrawing) => {
  const key = useId();
  const { registerDrawing } = useMap();
  useEffect(() => {
    registerDrawing(key, drawing);
  }, [registerDrawing, key, drawing]);
  useEffect(() => () => registerDrawing(key, null), [registerDrawing, key]);
};
export const useAccessibleMapFeatures = (
  id: string,
  data: unknown,
  accessibility: MapGeoJSONProps["accessibility"],
  onPress?: MapGeoJSONProps["onPress"]
) => {
  const { registerAccessibleFeatures } = useMap();
  const features = useMemo(
    () => (accessibility ? describeMapFeatures(data, accessibility) : []),
    [accessibility, data]
  );
  useEffect(() => {
    if (!accessibility) {
      return;
    }
    registerAccessibleFeatures(id, { features, onPress });
    return () => registerAccessibleFeatures(id, null);
  }, [registerAccessibleFeatures, id, features, onPress, accessibility]);
};
export const MapRoute = asMapLayer(
  ({
    coordinates,
    color,
    width = 3,
    dashed = false,
    opacity = 1,
    id = "route",
  }: MapRouteProps) => {
    const primary = useThemeToken("primary");
    const drawing = useMemo<MapDrawing>(
      () => ({
        data: {
          geometry: { coordinates, type: "LineString" },
          properties: {},
          type: "Feature",
        },
        kind: "route",
        options: { color: color ?? primary, dashed, id, opacity, width },
      }),
      [coordinates, color, primary, width, dashed, opacity, id]
    );
    useDrawing(drawing);
    return null;
  }
);
MapRoute.displayName = "Map.Route";
export const MapArc = asMapLayer(
  ({
    from,
    to,
    curvature = 0.2,
    color,
    width = 2,
    opacity = 0.9,
    id = "arc",
  }: MapArcProps) => {
    const coordinates = useMemo(
      () => arcCoordinates(from, to, curvature),
      [from, to, curvature]
    );
    return (
      <MapRoute
        coordinates={coordinates}
        color={color}
        width={width}
        opacity={opacity}
        id={id}
      />
    );
  }
);
MapArc.displayName = "Map.Arc";
export const MapGeoJSON = asMapLayer(
  ({
    data,
    fill,
    stroke,
    strokeWidth = 1,
    fillOpacity = 0.7,
    onPress,
    accessibility,
    id = "geojson",
  }: MapGeoJSONProps) => {
    const loaded = useMapData(data);
    const primary = useThemeToken("primary");
    const border = useThemeToken("border");
    useAccessibleMapFeatures(id, loaded, accessibility, onPress);
    const drawing = useMemo<MapDrawing>(
      () => ({
        data: loaded,
        kind: "geojson",
        onPress,
        options: {
          fill: fill ?? primary,
          fillOpacity,
          id,
          stroke: stroke ?? border,
          strokeWidth,
        },
      }),
      [
        loaded,
        fill,
        primary,
        stroke,
        border,
        strokeWidth,
        fillOpacity,
        id,
        onPress,
      ]
    );
    useDrawing(drawing);
    return null;
  }
);
MapGeoJSON.displayName = "Map.GeoJSON";
export const MapHeatmap = asMapLayer(
  ({
    data,
    weight,
    color,
    colors,
    radius = 24,
    intensity = 1,
    opacity = 0.85,
    maxZoom = 15,
    points = false,
    id = "heatmap",
  }: MapHeatmapProps) => {
    const loaded = useMapData(data);
    const fallback = useThemeToken("chart-2");
    const { theme } = useTheme();
    const tokenName = color?.replace(/^--(?:color-|panel-)?/u, "");
    const tokens = getRegisteredThemeTokens(theme);
    const resolvedToken =
      tokenName && tokenName in tokens
        ? Reflect.get(tokens, tokenName)
        : "#3b82f6";
    const tokenColor = color?.startsWith("--") ? String(resolvedToken) : color;
    const drawing = useMemo<MapDrawing>(
      () => ({
        data: loaded,
        kind: "heatmap",
        options: {
          color: tokenColor ?? fallback,
          colors,
          id,
          intensity,
          maxZoom,
          opacity,
          points,
          radius,
          weight,
        },
      }),
      [
        loaded,
        weight,
        tokenColor,
        fallback,
        colors,
        radius,
        intensity,
        opacity,
        maxZoom,
        points,
        id,
      ]
    );
    useDrawing(drawing);
    return null;
  }
);
MapHeatmap.displayName = "Map.Heatmap";
export const MapUserLocation = asMapLayer(
  ({ heading = false, accuracy = false }: MapUserLocationProps) => {
    const id = useId();
    const { setLocation, issue } = useMap();
    useEffect(() => {
      setLocation(id, { accuracy, heading });
      if (heading || accuracy) {
        issue({
          capability: "user-location-decoration",
          message:
            "WeChat uses its built-in location dot; heading and accuracy decorations cannot be independently styled or toggled.",
        });
      }
      return () => setLocation(id, null);
    }, [id, setLocation, issue, heading, accuracy]);
    return null;
  }
);
MapUserLocation.displayName = "Map.UserLocation";
