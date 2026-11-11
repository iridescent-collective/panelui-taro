import { validLngLat } from "./coordinates";
import type { LngLat } from "./types";

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
export interface MapGeometry {
  feature: unknown;
  type: "line" | "polygon" | "point";
  coordinates: LngLat[][];
}
export const geoJSONFeatures = (data: unknown): unknown[] => {
  if (!isRecord(data)) {
    return [];
  }
  if (data.type === "FeatureCollection" && Array.isArray(data.features)) {
    return data.features;
  }
  if (data.type === "Feature") {
    return [data];
  }
  return [];
};
const positions = (value: unknown): LngLat[] =>
  Array.isArray(value)
    ? value.filter(validLngLat).map((point) => [point[0], point[1]])
    : [];
export const geoJSONGeometry = (data: unknown): MapGeometry[] => {
  const result: MapGeometry[] = [];
  const visit = (geometry: unknown, feature: unknown) => {
    if (!isRecord(geometry)) {
      return;
    }
    const coords = geometry.coordinates;
    switch (geometry.type) {
      case "Point": {
        if (validLngLat(coords)) {
          result.push({ coordinates: [[coords]], feature, type: "point" });
        }
        break;
      }
      case "MultiPoint": {
        for (const point of positions(coords)) {
          result.push({ coordinates: [[point]], feature, type: "point" });
        }
        break;
      }
      case "LineString": {
        result.push({
          coordinates: [positions(coords)],
          feature,
          type: "line",
        });
        break;
      }
      case "MultiLineString": {
        if (Array.isArray(coords)) {
          for (const line of coords) {
            result.push({
              coordinates: [positions(line)],
              feature,
              type: "line",
            });
          }
        }
        break;
      }
      case "Polygon": {
        if (Array.isArray(coords)) {
          result.push({
            coordinates: coords.map(positions),
            feature,
            type: "polygon",
          });
        }
        break;
      }
      case "MultiPolygon": {
        if (Array.isArray(coords)) {
          for (const polygon of coords) {
            if (Array.isArray(polygon)) {
              result.push({
                coordinates: polygon.map(positions),
                feature,
                type: "polygon",
              });
            }
          }
        }
        break;
      }
      case "GeometryCollection": {
        if (Array.isArray(geometry.geometries)) {
          for (const nested of geometry.geometries) {
            visit(nested, feature);
          }
        }
        break;
      }
      default: {
        throw new Error(
          `Map: unsupported GeoJSON geometry ${String(geometry.type)}`
        );
      }
    }
  };
  if (
    isRecord(data) &&
    data.type !== "Feature" &&
    data.type !== "FeatureCollection"
  ) {
    visit(data, { geometry: data, properties: {}, type: "Feature" });
  } else {
    for (const feature of geoJSONFeatures(data)) {
      if (isRecord(feature)) {
        visit(feature.geometry, feature);
      }
    }
  }
  return result;
};
export const featureProperties = (feature: unknown) =>
  isRecord(feature) && isRecord(feature.properties) ? feature.properties : {};
