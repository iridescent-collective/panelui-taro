import { Path } from "../../primitives/static-svg";
import type { MapDrawing } from "./context";
import { evaluateMapExpression } from "./expression";
import type { MapProjectedGeometry } from "./types";

const finite = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const color = (value: unknown, feature: unknown, zoom: number) => {
  const resolved = evaluateMapExpression(value, { feature, zoom });
  if (typeof resolved !== "string") {
    throw new TypeError("Map: layer expression did not resolve to a color");
  }
  return resolved;
};
export const mapVectorGraphics = (
  geometry: MapProjectedGeometry[],
  drawing: MapDrawing,
  zoom: number
) =>
  geometry.map((item, index) => {
    if (item.type === "point") {
      return null;
    }
    const d = item.coordinates
      .map((ring) =>
        ring.length
          ? `${ring.map((point, at) => `${at ? "L" : "M"}${point[0]},${point[1]}`).join("")}${item.type === "polygon" ? "Z" : ""}`
          : ""
      )
      .join("");
    const { options } = drawing;
    if (drawing.kind === "geojson") {
      return (
        <Path
          key={index}
          d={d}
          fill={
            item.type === "polygon"
              ? color(options.fill, item.feature, zoom)
              : "none"
          }
          fillOpacity={finite(options.fillOpacity, 0.7)}
          fillRule="evenodd"
          stroke={color(options.stroke, item.feature, zoom)}
          strokeWidth={finite(options.strokeWidth, 1)}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    const width = finite(options.width, 3);
    return (
      <Path
        key={index}
        d={d}
        fill="none"
        stroke={typeof options.color === "string" ? options.color : "#262626"}
        strokeWidth={width}
        opacity={finite(options.opacity, 1)}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...(options.dashed
          ? { strokeDasharray: `${2 * width},${1.5 * width}` }
          : {})}
      />
    );
  });
