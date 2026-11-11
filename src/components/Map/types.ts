import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { BasemapSource } from "./basemap";
import type { MapFeatureAccessibility } from "./map-accessibility";
import type { MapOverlayPosition } from "./map-insets";

export type LngLat = [number, number];
export type LngLatBounds = [number, number, number, number];
export type PixelPoint = [number, number];
export type StyleSpecification = Record<string, unknown>;
export interface ViewState {
  center: LngLat;
  zoom: number;
  bearing: number;
  pitch: number;
  bounds: LngLatBounds;
}
export interface MapRef {
  getCenter: () => Promise<LngLat>;
  getZoom: () => Promise<number>;
  getBearing: () => Promise<number>;
  getPitch: () => Promise<number>;
  getBounds: () => Promise<LngLatBounds>;
  getViewState: () => Promise<ViewState>;
}
export interface ViewPadding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}
export interface CameraOptions {
  zoom?: number;
  bearing?: number;
  pitch?: number;
  padding?: ViewPadding;
}
export interface CameraAnimationOptions {
  duration?: number;
  easing?: "linear" | "ease" | "fly";
}
export type InitialViewState =
  | (CameraOptions & {
      center?: never;
      bounds?: never;
    })
  | (CameraOptions & {
      center: LngLat;
      bounds?: never;
    })
  | (CameraOptions & {
      bounds: LngLatBounds;
      center?: never;
    });
export interface CameraRef {
  jumpTo: (
    options: {
      center: LngLat;
    } & CameraOptions
  ) => void;
  easeTo: (
    options: {
      center?: LngLat;
    } & CameraOptions &
      CameraAnimationOptions
  ) => void;
  flyTo: (
    options: {
      center?: LngLat;
    } & CameraOptions &
      CameraAnimationOptions
  ) => void;
  fitBounds: (
    bounds: LngLatBounds,
    options?: CameraOptions & CameraAnimationOptions
  ) => void;
}
export interface NativeEvent<T> {
  nativeEvent: T;
}
export type MapControlsPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
export interface MapFitBoundsOptions {
  padding?: number | ViewPadding;
  duration?: number;
}
export interface MapHandle {
  flyTo: (options: {
    center: LngLat;
    zoom?: number;
    duration?: number;
  }) => void;
  fitBounds: (
    bounds: LngLatBounds,
    options?: number | MapFitBoundsOptions
  ) => void;
  recenter: (duration?: number) => void;
  getViewState: () => Promise<ViewState | null>;
}
export interface MapProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  coordinateSystem?: "wgs84" | "gcj02";
  nativeStyle?: {
    subkey?: string;
    layerStyle?: number;
  };
  onAdapterIssue?: (issue: MapAdapterIssue) => void;
  children?: ReactNode;
  center?: LngLat;
  zoom?: number;
  bearing?: number;
  pitch?: number;
  bounds?: LngLatBounds;
  blank?: boolean;
  source?: BasemapSource;
  mapStyle?: string | StyleSpecification;
  rotatable?: boolean;
  interactive?: boolean;
  onViewStateChange?: (state: ViewState) => void;
  onPress?: (lngLat: LngLat, point: PixelPoint) => void;
  onReady?: () => void;
}
export interface MapMarkerProps extends Omit<
  AnimatedPressableProps,
  "children" | "onPress" | "style"
> {
  lngLat: LngLat;
  anchor?: "center" | "top" | "bottom" | "left" | "right";
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
  children?: ReactNode;
}
export interface MapLabelProps {
  children?: ReactNode;
  className?: string;
  side?: "top" | "bottom";
  size?: "sm" | "md";
  tone?: "default" | "muted" | "primary";
}
export interface MapPopupProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  lngLat?: LngLat;
}
export interface MapControlsProps {
  position?: MapControlsPosition;
  inset?: number | ViewPadding;
  safeArea?: boolean;
  zoom?: boolean;
  locate?: boolean;
  compass?: boolean;
  recenter?: boolean;
  className?: string;
  onLocate?: (lngLat: LngLat) => void;
}
export interface MapOverlayProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  children?: ReactNode;
  position?: MapOverlayPosition;
  inset?: number | ViewPadding;
  safeArea?: boolean;
  className?: string;
}
export interface MapRouteProps {
  coordinates: LngLat[];
  color?: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
  id?: string;
}
export interface MapArcProps {
  from: LngLat;
  to: LngLat;
  curvature?: number;
  color?: string;
  width?: number;
  opacity?: number;
  id?: string;
}
export interface MapGeoJSONProps {
  data: unknown;
  fill?: string | unknown[];
  stroke?: string | unknown[];
  strokeWidth?: number;
  fillOpacity?: number;
  onPress?: (feature: unknown) => void;
  accessibility?: (feature: unknown, index: number) => MapFeatureAccessibility;
  id?: string;
}
export interface MapClusterProps {
  data: unknown;
  color?: string;
  textColor?: string;
  radius?: number;
  maxZoom?: number;
  onPress?: (feature: unknown) => void;
  accessibility?: (feature: unknown, index: number) => MapFeatureAccessibility;
  id?: string;
}
export interface MapHeatmapProps {
  data: unknown;
  weight?: string;
  color?: string;
  colors?: string[];
  radius?: number;
  intensity?: number;
  opacity?: number;
  maxZoom?: number;
  points?: boolean;
  id?: string;
}
export interface MapUserLocationProps {
  heading?: boolean;
  accuracy?: boolean;
}
export interface MapAdapterIssue {
  capability: string;
  message: string;
}

export interface MapProjectedGeometry {
  feature: unknown;
  type: "line" | "polygon" | "point";
  coordinates: PixelPoint[][];
}
