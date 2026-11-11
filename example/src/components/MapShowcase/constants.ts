import type { LngLat } from "panelui-taro/map";

export const MAP_CENTER: LngLat = [121.4737, 31.2304];
export const MAP_ROUTE: LngLat[] = [
  [121.451, 31.219],
  [121.46, 31.225],
  [121.4737, 31.2304],
  [121.481, 31.237],
  [121.493, 31.243],
];
export const MAP_AREA = {
  features: [
    {
      geometry: {
        coordinates: [
          [
            [121.465, 31.224],
            [121.482, 31.224],
            [121.482, 31.236],
            [121.465, 31.236],
            [121.465, 31.224],
          ],
          [
            [121.469, 31.228],
            [121.474, 31.228],
            [121.474, 31.232],
            [121.469, 31.232],
            [121.469, 31.228],
          ],
        ],
        type: "Polygon",
      },
      id: "area",
      properties: { label: "Shanghai study area" },
      type: "Feature",
    },
  ],
  type: "FeatureCollection",
};
export const MAP_POINTS = {
  features: Array.from({ length: 24 }, (_, index) => ({
    geometry: {
      coordinates: [
        121.4737 + Math.cos(index * 0.9) * (0.003 + index * 0.0007),
        31.2304 + Math.sin(index * 0.9) * (0.002 + index * 0.0005),
      ],
      type: "Point",
    },
    id: `point-${index}`,
    properties: {
      label: `Point ${index + 1}`,
      weight: 0.2 + (index % 5) * 0.2,
    },
    type: "Feature",
  })),
  type: "FeatureCollection",
};
