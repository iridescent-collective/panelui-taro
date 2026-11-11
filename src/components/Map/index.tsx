import { MapCluster } from "./cluster";
import { MapControls } from "./controls";
import {
  MapArc,
  MapGeoJSON,
  MapHeatmap,
  MapRoute,
  MapUserLocation,
} from "./layers";
import { MapLabel, MapMarker, MapPopup } from "./marker";
import { MapOverlay } from "./overlay";
import { MapRoot } from "./root";

export { CARTO_SOURCE, buildBasemapStyle } from "./basemap";
export type { BasemapSource, BasemapTokens } from "./basemap";
export { useMap } from "./context";
export type { MapFeatureAccessibility } from "./map-accessibility";
export type { MapOverlayPosition } from "./map-insets";
export type {
  LngLat,
  LngLatBounds,
  PixelPoint,
  ViewPadding,
  ViewState,
  MapControlsPosition,
  MapFitBoundsOptions,
  MapHandle,
  MapProps,
  MapMarkerProps,
  MapLabelProps,
  MapPopupProps,
  MapControlsProps,
  MapOverlayProps,
  MapRouteProps,
  MapArcProps,
  MapGeoJSONProps,
  MapClusterProps,
  MapHeatmapProps,
  MapUserLocationProps,
  MapAdapterIssue,
} from "./types";
export const hasMapLibre = false;
export const hasNativeMap = true;
export const Map = Object.assign(MapRoot, {
  Arc: MapArc,
  Cluster: MapCluster,
  Controls: MapControls,
  GeoJSON: MapGeoJSON,
  Heatmap: MapHeatmap,
  Label: MapLabel,
  Marker: MapMarker,
  Overlay: MapOverlay,
  Popup: MapPopup,
  Route: MapRoute,
  UserLocation: MapUserLocation,
});
