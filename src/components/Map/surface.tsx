import { Canvas, View } from "@tarojs/components";
import type { Canvas as NativeCanvas } from "@tarojs/taro";
import { useEffect, useId, useMemo, useRef } from "react";

import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { useMap } from "./context";
import type { MapDrawing } from "./context";
import { evaluateMapExpression } from "./expression";
import { featureProperties, geoJSONGeometry } from "./geojson";
import { heatmapPixels, heatmapRamp, heatmapSettings } from "./heatmap";
import type { HeatPoint } from "./heatmap";
import { projectMapCoordinates } from "./projection";
import type {
  MapProjectedGeometry as ProjectedGeometry,
  PixelPoint,
} from "./types";
import { useMapProjectionJob } from "./use-projection-job";

const finite = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const string = (value: unknown, fallback: string) =>
  typeof value === "string" ? value : fallback;
const color = (value: unknown, feature: unknown, zoom: number) => {
  const resolved = evaluateMapExpression(value, { feature, zoom });
  if (typeof resolved !== "string") {
    throw new TypeError("Map: layer expression did not resolve to a color");
  }
  return resolved;
};
export const pointInRing = (point: PixelPoint, ring: PixelPoint[]) => {
  let inside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index, index += 1
  ) {
    const [x, y] = ring[index];
    const [px, py] = ring[previous];
    if (
      y > point[1] !== py > point[1] &&
      point[0] < ((px - x) * (point[1] - y)) / (py - y) + x
    ) {
      inside = !inside;
    }
  }
  return inside;
};
export const distanceToSegment = (
  point: PixelPoint,
  a: PixelPoint,
  b: PixelPoint
) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  const t = length
    ? Math.max(
        0,
        Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length)
      )
    : 0;
  return Math.hypot(point[0] - a[0] - t * dx, point[1] - a[1] - t * dy);
};
export const hitMapGeometry = (
  point: PixelPoint,
  geometry: {
    type: "line" | "polygon" | "point";
    coordinates: PixelPoint[][];
  },
  width: number
) => {
  if (geometry.type === "polygon") {
    let inside = false;
    for (const ring of geometry.coordinates) {
      if (pointInRing(point, ring)) {
        inside = !inside;
      }
    }
    if (inside) {
      return true;
    }
  }
  for (const line of geometry.coordinates) {
    for (let index = 1; index < line.length; index += 1) {
      if (
        distanceToSegment(point, line[index - 1], line[index]) <=
        Math.max(2, width / 2)
      ) {
        return true;
      }
    }
  }
  return false;
};
const paths = (ctx: CanvasRenderingContext2D, geometry: ProjectedGeometry) => {
  ctx.beginPath();
  for (const line of geometry.coordinates) {
    if (!line.length) {
      continue;
    }
    ctx.moveTo(line[0][0], line[0][1]);
    for (const point of line.slice(1)) {
      ctx.lineTo(point[0], point[1]);
    }
    if (geometry.type === "polygon") {
      ctx.closePath();
    }
  }
};
const paintLayer = (
  ctx: CanvasRenderingContext2D,
  geometry: ProjectedGeometry[],
  drawing: MapDrawing,
  zoom: number
) => {
  const { options } = drawing;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (drawing.kind === "heatmap") {
    return;
  }
  for (const item of geometry) {
    if (item.type === "point") {
      continue;
    }
    paths(ctx, item);
    if (drawing.kind === "geojson") {
      if (item.type === "polygon") {
        ctx.fillStyle = color(options.fill, item.feature, zoom);
        ctx.globalAlpha = finite(options.fillOpacity, 0.7);
        ctx.fill("evenodd");
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color(options.stroke, item.feature, zoom);
      ctx.lineWidth = finite(options.strokeWidth, 1);
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = string(options.color, "#262626");
      ctx.lineWidth = finite(options.width, 3);
      ctx.globalAlpha = finite(options.opacity, 1);
      ctx.setLineDash(
        options.dashed ? [2 * ctx.lineWidth, 1.5 * ctx.lineWidth] : []
      );
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};
const paintHeatmap = (
  ctx: CanvasRenderingContext2D,
  canvas: NativeCanvas,
  geometry: ProjectedGeometry[],
  options: Record<string, unknown>,
  zoom: number,
  ratio: number
) => {
  const { width } = canvas;
  const { height } = canvas;
  const sourcePoints: HeatPoint[] = geometry
    .filter((value) => value.type === "point")
    .map((value) => ({
      feature: value.feature,
      point: value.coordinates[0][0],
    }));
  const maxZoom = finite(options.maxZoom, 15);
  const settings = heatmapSettings(
    zoom,
    finite(options.radius, 24),
    finite(options.intensity, 1),
    finite(options.opacity, 0.85),
    maxZoom
  );
  const ramp = heatmapRamp(string(options.color, "#3b82f6"), options.colors);
  const weight =
    typeof options.weight === "string" ? options.weight : undefined;
  if (zoom < maxZoom && settings.opacity > 0) {
    const image = ctx.createImageData(width, height);
    const scaled = sourcePoints.map((value) => ({
      ...value,
      point: [value.point[0] * ratio, value.point[1] * ratio] as PixelPoint,
    }));
    image.data.set(
      heatmapPixels(width, height, scaled, {
        ...settings,
        radius: settings.radius * ratio,
        ramp,
        weight,
      })
    );
    ctx.putImageData(image, 0, 0);
  }
  if (options.points && zoom >= maxZoom - 2) {
    for (const value of sourcePoints) {
      const amount = weight
        ? Math.min(
            1,
            Math.max(0, Number(featureProperties(value.feature)[weight]) || 0)
          )
        : 1;
      ctx.beginPath();
      ctx.arc(
        value.point[0],
        value.point[1],
        weight ? 3 + amount * 6 : 5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = weight
        ? color(
            [
              "interpolate",
              ["linear"],
              ["literal", amount],
              0,
              ramp[0],
              1,
              ramp.at(-1),
            ],
            value.feature,
            zoom
          )
        : (ramp.at(-1) ?? "#3b82f6");
      ctx.globalAlpha = settings.pointOpacity;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.globalAlpha = settings.pointStrokeOpacity;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
};
const DrawingSurface = ({ drawing }: { drawing: MapDrawing }) => {
  const map = useMap();
  const id = `map-layer-${useId().replaceAll(":", "")}`;
  const geometries = useRef<ProjectedGeometry[]>([]);
  const surface = useCanvasSurface(
    id,
    map.width,
    map.height,
    (ctx, node) => {
      if (!map.ready) return;
      if (drawing.kind === "heatmap") {
        paintHeatmap(
          ctx,
          node as unknown as NativeCanvas,
          geometries.current,
          drawing.options,
          map.state.zoom,
          node.width / map.width
        );
      } else paintLayer(ctx, geometries.current, drawing, map.state.zoom);
    },
    (error) =>
      map.issue({
        capability: "map-canvas",
        message:
          error instanceof Error ? error.message : "Map layer rendering failed",
      })
  );
  const identity = useMemo(
    () => ({
      drawing,
      height: map.height,
      project: map.project,
      width: map.width,
    }),
    [drawing, map.project, map.width, map.height]
  );
  useMapProjectionJob<typeof identity, ProjectedGeometry[]>({
    enabled: map.ready,
    fail: (error) =>
      map.issue({
        capability: `map-${drawing.kind}`,
        message:
          error instanceof Error ? error.message : "Map layer rendering failed",
      }),
    identity,
    receive: (next) => {
      geometries.current = next;
      surface.requestPaint();
    },
    revision: map.revision,
    work: async (isCurrent) => {
      const geometry = geoJSONGeometry(drawing.data).filter(
        (item) => drawing.kind !== "geojson" || item.type !== "point"
      );
      const coordinates = geometry.flatMap((item) => item.coordinates.flat());
      const pixels = await projectMapCoordinates(
        coordinates,
        map.project,
        isCurrent
      );
      let cursor = 0;
      return geometry.map((item) => ({
        ...item,
        coordinates: item.coordinates.map((line) => {
          const result = pixels.slice(cursor, cursor + line.length);
          cursor += line.length;
          return result;
        }),
      }));
    },
  });
  useEffect(() => {
    if (!drawing.onPress) {
      return;
    }
    map.registerTap(id, (point) => {
      for (let index = geometries.current.length - 1; index >= 0; index -= 1) {
        const geometry = geometries.current[index];
        if (
          hitMapGeometry(
            point,
            geometry,
            finite(drawing.options.strokeWidth, 1)
          )
        ) {
          drawing.onPress?.(geometry.feature);
          return true;
        }
      }
      return false;
    });
    return () => map.registerTap(id, null);
  }, [map.registerTap, id, drawing]);
  return (
    <Canvas
      id={id}
      type="2d"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={{
        pointerEvents: "none",
        zIndex: 1,
        opacity: surface.occluded || surface.unavailable ? 0 : 1,
      }}
    />
  );
};
export const MapSurface = ({
  drawings,
}: {
  drawings: ReadonlyMap<string, MapDrawing>;
}) => (
  <>
    {[...drawings].map(([id, drawing]) => (
      <DrawingSurface key={id} drawing={drawing} />
    ))}
  </>
);
