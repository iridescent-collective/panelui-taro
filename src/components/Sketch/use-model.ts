import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { Ref, SetStateAction } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { selectionTick } from "../../lib/haptics";
import { readCanvasPoints } from "../../primitives/canvas-touch";
import { useThemeToken } from "../../theme/use-theme";
import {
  ALL_SHAPES,
  DEFAULT_COLORS,
  ERASER_SCALE,
  MIN_DISTANCE,
} from "./constants";
import { safeId, shapePath, strokePath, svgDocument } from "./math";
import type {
  SketchHandle,
  SketchItem,
  SketchProps,
  SketchShape,
  SketchTool,
} from "./types";
import { useSketchCanvas } from "./use-canvas";

export const useSketchModel = (
  settings: SketchProps,
  ref: Ref<SketchHandle>
) => {
  const {
    colors = DEFAULT_COLORS,
    defaultColor,
    defaultTool = "pen",
    defaultShape = "rectangle",
    shapes = ALL_SHAPES,
    defaultSize = 6,
    minSize = 2,
    maxSize = 24,
    customColor = true,
    onClose,
    onDone,
    onChange,
    className,
    ...props
  } = settings;
  const foreground = useThemeToken("foreground");
  const surface = useThemeToken("popover");
  const primaryFg = useThemeToken("primary-foreground");
  const mutedColor = useThemeToken("muted-foreground");
  const maskId = safeId(useId());
  const canvasId = `sketch-canvas-${maskId}`;
  const exportId = `sketch-export-${maskId}`;
  const layout = useElementLayout(true, "sketch", undefined, false);
  const width = layout.layout?.width ?? 0;
  const height = layout.layout?.height ?? 0;
  const { scale } = useWindowMetrics();
  const [items, setItems] = useState<SketchItem[]>([]);
  const currentItems = useRef(items);
  const [tool, setTool] = useState<SketchTool>(defaultTool);
  const [shape, setShape] = useState<SketchShape>(defaultShape);
  const [shapePicked, setShapePicked] = useState(defaultTool === "shape");
  const [color, setColor] = useState(defaultColor);
  const [custom, setCustom] = useState<string | null>(null);
  const [size, setSize] = useState(defaultSize);
  const [card, setCardState] = useState<"shapes" | "color" | null>(null);
  const cardRef = useRef(card);
  const ink = color ?? foreground;
  const live = useRef<SketchItem | null>(null);
  const gesture = useRef<{
    tool: SketchTool;
    points: number[];
    anchor: {
      x: number;
      y: number;
    };
    tip: {
      x: number;
      y: number;
    };
  } | null>(null);
  const [, invalidate] = useState(0);
  const canvas = useSketchCanvas(canvasId, exportId, {
    height,
    items,
    live: live.current,
    surface,
    width,
  });
  const frame = () => ({
    height,
    items: currentItems.current,
    live: live.current,
    surface,
    width,
  });
  const repaint = () => {
    canvas.draw(frame());
    if (canvas.fallback) {
      invalidate((value) => value + 1);
    }
  };
  const replace = useCallback((next: SketchItem[]) => {
    currentItems.current = next;
    setItems(next);
  }, []);
  const reported = useRef(0);
  const change = useRef(onChange);
  change.current = onChange;
  useEffect(() => {
    if (reported.current !== items.length) {
      reported.current = items.length;
      change.current?.(items.length);
    }
  }, [items.length]);
  const toSVG = () => svgDocument(currentItems.current, width, height, maskId);
  const undo = () => replace(currentItems.current.slice(0, -1));
  const clear = () => {
    gesture.current = null;
    live.current = null;
    replace([]);
  };
  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => currentItems.current.length === 0,
    toPNG: ({ scale: exportScale = 2 } = {}) =>
      canvas.rasterise(exportScale, frame()),
    toSVG,
    undo,
  }));
  const average = (event: unknown) => {
    const points = readCanvasPoints(event);
    if (!points.length) {
      return null;
    }
    let x = 0;
    let y = 0;
    for (const point of points) {
      x += point.x;
      y += point.y;
    }
    return { x: (x / points.length) * scale, y: (y / points.length) * scale };
  };
  const updateLive = () => {
    const active = gesture.current;
    if (!active) {
      return;
    }
    if (active.tool === "shape") {
      live.current = {
        color: ink,
        d: shapePath(
          ALL_SHAPES.indexOf(shape),
          active.anchor.x,
          active.anchor.y,
          active.tip.x,
          active.tip.y,
          size
        ),
        shape,
        type: "shape",
        width: size,
      };
    } else if (active.tool === "eraser") {
      live.current = {
        d: strokePath(active.points),
        type: "erase",
        width: size * ERASER_SCALE,
      };
    } else {
      live.current = {
        color: ink,
        d: strokePath(active.points),
        type: "stroke",
        width: size,
      };
    }
    repaint();
  };
  const start = (event: unknown) => {
    const point = average(event);
    if (!point) {
      return;
    }
    gesture.current = {
      anchor: point,
      points: [point.x, point.y],
      tip: point,
      tool,
    };
    updateLive();
  };
  const move = (event: unknown) => {
    const active = gesture.current;
    const point = average(event);
    if (!active || !point) {
      return;
    }
    if (active.tool === "shape") {
      active.tip = point;
    } else {
      const dx = point.x - (active.points.at(-2) ?? 0);
      const dy = point.y - (active.points.at(-1) ?? 0);
      if (dx * dx + dy * dy < MIN_DISTANCE * MIN_DISTANCE) {
        return;
      }
      active.points.push(point.x, point.y);
    }
    updateLive();
  };
  const finish = () => {
    const active = gesture.current;
    if (!active) {
      return;
    }
    updateLive();
    gesture.current = null;
    const mark = live.current;
    live.current = null;
    if (
      mark &&
      !(
        active.tool === "shape" &&
        Math.abs(active.tip.x - active.anchor.x) < 4 &&
        Math.abs(active.tip.y - active.anchor.y) < 4
      )
    ) {
      replace([...currentItems.current, mark]);
    }
    repaint();
  };
  const setCard = (request: SetStateAction<typeof card>) => {
    const next =
      typeof request === "function" ? request(cardRef.current) : request;
    if (next !== null) {
      finish();
    }
    cardRef.current = next;
    setCardState(next);
  };
  const pickTool = (next: SketchTool) => {
    void selectionTick();
    if (next === "shape") {
      setCard((value) => (value === "shapes" ? null : "shapes"));
      if (shapePicked) {
        setTool("shape");
      }
      return;
    }
    setCard(null);
    setTool(next);
  };
  const pickShape = (next: SketchShape) => {
    void selectionTick();
    setShape(next);
    setShapePicked(true);
    setTool("shape");
    setCard(null);
  };
  const pickColor = (next: string) => {
    void selectionTick();
    setColor(next);
    setCustom(null);
    if (tool === "eraser") {
      setTool("pen");
    }
    setCard(null);
  };
  const pickCustom = (next: string) => {
    setCustom(next);
    setColor(next);
    if (tool === "eraser") {
      setTool("pen");
    }
  };
  const done = () => {
    if (!onDone || !currentItems.current.length) {
      return;
    }
    onDone({
      height: Math.round(height),
      items: currentItems.current.map((item) => ({ ...item })),
      svg: toSVG(),
      width: Math.round(width),
    });
  };
  return {
    canvas,
    canvasId,
    card,
    className,
    colors,
    custom,
    customColor,
    done,
    exportId,
    fallbackSVG: svgDocument(
      live.current
        ? [
            ...items,
            live.current.type === "erase"
              ? {
                  color: surface,
                  d: live.current.d,
                  type: "stroke",
                  width: live.current.width,
                }
              : live.current,
          ]
        : items,
      width,
      height,
      maskId
    ),
    finish,
    foreground,
    height,
    ink,
    items,
    layout,
    maskId,
    maxSize,
    minSize,
    move,
    mutedColor,
    onClose,
    onDone,
    pickColor,
    pickCustom,
    pickShape,
    pickTool,
    primaryFg,
    props,
    setCard,
    setSize,
    shape,
    shapePicked,
    size,
    start,
    surface,
    tool,
    undo,
    visibleShapes: shapes.filter((entry) => ALL_SHAPES.includes(entry)),
    width,
  };
};
