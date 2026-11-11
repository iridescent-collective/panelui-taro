import type { StyleSpecification } from "./types";

export interface BasemapTokens {
  background: string;
  water: string;
  land: string;
  building: string;
  line: string;
  label: string;
  labelHalo: string;
}
export interface BasemapSource {
  url: string;
  glyphs: string;
  fonts: string[];
  attribution?: string;
}
export const CARTO_SOURCE: BasemapSource = {
  attribution: "© OpenStreetMap contributors, © CARTO",
  fonts: ["Montserrat Regular", "Open Sans Regular", "Noto Sans Regular"],
  glyphs: "https://tiles.basemaps.cartocdn.com/fonts/{fontstack}/{range}.pbf",
  url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
};
const SOURCE_ID = "basemap";
const width = (stops: [number, number][]) =>
  [
    "interpolate",
    ["exponential", 1.5],
    ["zoom"],
    ...stops.flat(),
  ] as unknown as number;
export const buildBasemapStyle = (
  tokens: BasemapTokens,
  options: {
    blank?: boolean;
    source?: BasemapSource;
  } = {}
): StyleSpecification => {
  const { blank = false, source = CARTO_SOURCE } = options;
  const ground = {
    id: "ground",
    paint: { "background-color": tokens.background },
    type: "background",
  };
  if (blank) {
    return {
      layers: [ground],
      name: "PanelUI blank",
      sources: {},
      version: 8,
    } as unknown as StyleSpecification;
  }
  const label = {
    "text-font": source.fonts,
    "text-max-width": 8,
  };
  const labelPaint = {
    "text-color": tokens.label,
    "text-halo-color": tokens.labelHalo,
    "text-halo-width": 1.2,
  };
  return {
    glyphs: source.glyphs,
    layers: [
      ground,
      {
        id: "landcover",
        paint: { "fill-color": tokens.land, "fill-opacity": 0.7 },
        source: SOURCE_ID,
        "source-layer": "landcover",
        type: "fill",
      },
      {
        id: "park",
        paint: { "fill-color": tokens.land, "fill-opacity": 0.7 },
        source: SOURCE_ID,
        "source-layer": "park",
        type: "fill",
      },
      {
        id: "water",
        paint: { "fill-color": tokens.water },
        source: SOURCE_ID,
        "source-layer": "water",
        type: "fill",
      },
      {
        id: "waterway",
        paint: {
          "line-color": tokens.water,
          "line-width": width([
            [8, 0.5],
            [16, 3],
          ]),
        },
        source: SOURCE_ID,
        "source-layer": "waterway",
        type: "line",
      },
      {
        id: "building",
        minzoom: 14,
        paint: { "fill-color": tokens.building, "fill-opacity": 0.8 },
        source: SOURCE_ID,
        "source-layer": "building",
        type: "fill",
      },
      {
        filter: [
          "match",
          ["get", "class"],
          ["minor", "service", "track"],
          true,
          false,
        ],
        id: "road-minor",
        layout: { "line-cap": "round", "line-join": "round" },
        minzoom: 12,
        paint: {
          "line-color": tokens.line,
          "line-width": width([
            [12, 0.4],
            [18, 6],
          ]),
        },
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
      },
      {
        filter: [
          "match",
          ["get", "class"],
          ["secondary", "tertiary"],
          true,
          false,
        ],
        id: "road-secondary",
        layout: { "line-cap": "round", "line-join": "round" },
        minzoom: 8,
        paint: {
          "line-color": tokens.line,
          "line-width": width([
            [8, 0.5],
            [18, 10],
          ]),
        },
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
      },
      {
        filter: [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary"],
          true,
          false,
        ],
        id: "road-major",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": tokens.line,
          "line-width": width([
            [5, 0.5],
            [18, 14],
          ]),
        },
        source: SOURCE_ID,
        "source-layer": "transportation",
        type: "line",
      },
      {
        filter: ["<=", ["get", "admin_level"], 4],
        id: "boundary",
        paint: {
          "line-color": tokens.line,
          "line-dasharray": [2, 2],
          "line-width": width([
            [3, 0.6],
            [12, 1.8],
          ]),
        },
        source: SOURCE_ID,
        "source-layer": "boundary",
        type: "line",
      },
      {
        id: "water-label",
        layout: { ...label, "text-field": ["get", "name"], "text-size": 11 },
        paint: labelPaint,
        source: SOURCE_ID,
        "source-layer": "water_name",
        type: "symbol",
      },
      {
        id: "road-label",
        layout: {
          ...label,
          "symbol-placement": "line",
          "text-field": ["get", "name"],
          "text-size": 10,
        },
        minzoom: 14,
        paint: labelPaint,
        source: SOURCE_ID,
        "source-layer": "transportation_name",
        type: "symbol",
      },
      {
        id: "place-label",
        layout: {
          ...label,
          "text-field": ["get", "name"],
          "text-size": ["match", ["get", "class"], "city", 14, "town", 12, 10],
        },
        paint: labelPaint,
        source: SOURCE_ID,
        "source-layer": "place",
        type: "symbol",
      },
    ],
    name: "PanelUI",
    sources: {
      [SOURCE_ID]: {
        type: "vector",
        url: source.url,
        ...(source.attribution ? { attribution: source.attribution } : {}),
      },
    },
    version: 8,
  } as unknown as StyleSpecification;
};
