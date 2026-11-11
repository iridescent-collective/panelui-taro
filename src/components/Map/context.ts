import type { MapContext as NativeMapContext } from "@tarojs/taro";
import { createContext, useContext } from "react";
import type { RefObject } from "react";

import type { MapFeatureAccessibilityDescription } from "./map-accessibility";
import type { MapReservation } from "./map-insets";
import type {
  CameraRef,
  LngLat,
  MapAdapterIssue,
  MapRef,
  PixelPoint,
  ViewState,
} from "./types";

export interface AccessibleFeatureGroup {
  features: MapFeatureAccessibilityDescription[];
  onPress?: (feature: unknown) => void;
}
export interface MapDrawing {
  kind: "route" | "geojson" | "heatmap";
  data: unknown;
  options: Record<string, unknown>;
  onPress?: (feature: unknown) => void;
}
export interface MapContextValue {
  mapRef: RefObject<MapRef | null>;
  cameraRef: RefObject<CameraRef | null>;
  nativeRef: RefObject<NativeMapContext | null>;
  ready: boolean;
  revision: number;
  state: ViewState;
  recenter: (duration?: number) => void;
  coordinateSystem: "wgs84" | "gcj02";
  width: number;
  height: number;
  toNative: (point: LngLat) => LngLat;
  fromNative: (point: LngLat) => LngLat;
  project: (point: LngLat) => Promise<PixelPoint>;
  registerDrawing: (id: string, drawing: MapDrawing | null) => void;
  registerAccessibleFeatures: (
    id: string,
    group: AccessibleFeatureGroup | null
  ) => void;
  issue: (value: MapAdapterIssue) => void;
  registerTap: (
    id: string,
    callback: ((point: PixelPoint) => boolean) | null
  ) => void;
  setLocation: (
    id: string,
    options: {
      heading: boolean;
      accuracy: boolean;
    } | null
  ) => void;
}
export const MapContext = createContext<MapContextValue | null>(null);
export const MapReservationsContext = createContext<readonly MapReservation[]>(
  []
);
export const MapReserveContext = createContext<
  ((id: string, reservation: MapReservation | null) => void) | null
>(null);
export const MarkerContext = createContext<LngLat | null>(null);
export const useMap = () => {
  const value = useContext(MapContext);
  if (!value) {
    throw new Error("useMap must be used inside a <Map>.");
  }
  return value;
};
