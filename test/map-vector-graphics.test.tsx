import { expect, it } from "vitest";

import type { MapDrawing } from "../src/components/Map/context";
import { mapVectorGraphics } from "../src/components/Map/graphics";
import { serializeSvgChildren } from "../src/primitives/static-svg";

const drawing: MapDrawing = {
  data: {},
  kind: "geojson",
  options: {
    fill: "#262626",
    fillOpacity: 0.2,
    stroke: "#777777",
    strokeWidth: 1,
  },
};
it("keeps polygon holes and independent fill opacity in ordinary SVG composition", () => {
  const graphic = mapVectorGraphics(
    [
      {
        coordinates: [
          [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ],
          [
            [2, 2],
            [8, 2],
            [8, 8],
            [2, 8],
          ],
        ],
        feature: {},
        type: "polygon",
      },
    ],
    drawing,
    13
  );
  const markup = serializeSvgChildren(graphic);
  expect(markup).toContain('d="M0,0L10,0L10,10L0,10ZM2,2L8,2L8,8L2,8Z"');
  expect(markup).toContain('fill-rule="evenodd"');
  expect(markup).toContain('fill-opacity="0.2"');
  expect(markup).toContain('stroke="#777777"');
});
it("keeps dashed route widths and opacity without native Canvas stacking", () => {
  const route: MapDrawing = {
    data: {},
    kind: "route",
    options: { color: "#123456", dashed: true, opacity: 0.9, width: 3 },
  };
  const markup = serializeSvgChildren(
    mapVectorGraphics(
      [
        {
          coordinates: [
            [
              [0, 0],
              [10, 10],
            ],
          ],
          feature: {},
          type: "line",
        },
      ],
      route,
      13
    )
  );
  expect(markup).toContain('fill="none"');
  expect(markup).toContain('stroke-dasharray="6,4.5"');
  expect(markup).toContain('opacity="0.9"');
});
