import { CONNECT_RADIUS, GRID_SPAN, LAYER_STEP } from "./constants";
import type { FlowRect } from "./flow-paths";
import { anchorOf } from "./flow-paths";
import type { FlowViewport, HandleEntry } from "./types";

export const clampCanvas = (value: number) =>
  Math.max(Math.min(value, 4000), 1);
export const flowLayer = (
  boxes: Record<string, FlowRect>,
  box: {
    width: number;
    height: number;
  }
) => {
  let reach = 0;
  for (const rect of Object.values(boxes)) {
    reach = Math.max(
      reach,
      Math.abs(rect.x),
      Math.abs(rect.y),
      Math.abs(rect.x + rect.width),
      Math.abs(rect.y + rect.height)
    );
  }
  reach = Math.ceil(reach / LAYER_STEP) * LAYER_STEP;
  return {
    height: clampCanvas(
      Math.max(Math.max(box.height, 480) * GRID_SPAN, reach * 2)
    ),
    width: clampCanvas(
      Math.max(Math.max(box.width, 320) * GRID_SPAN, reach * 2)
    ),
  };
};
export const fitFlow = (
  boxes: Record<string, FlowRect>,
  box: {
    width: number;
    height: number;
  },
  padding: number,
  min: number,
  max: number
): FlowViewport | null => {
  if (!box.width || !box.height) {
    return null;
  }
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const rect of Object.values(boxes)) {
    if (rect.width === 0 || rect.height === 0) {
      continue;
    }
    left = Math.min(left, rect.x);
    top = Math.min(top, rect.y);
    right = Math.max(right, rect.x + rect.width);
    bottom = Math.max(bottom, rect.y + rect.height);
  }
  if (!Number.isFinite(left)) {
    return null;
  }
  const width = Math.max(right - left, 1);
  const height = Math.max(bottom - top, 1);
  const zoom = Math.min(
    Math.max(
      Math.min(
        (box.width - padding * 2) / width,
        (box.height - padding * 2) / height
      ),
      min
    ),
    max
  );
  return {
    x: box.width / 2 - (left + width / 2) * zoom,
    y: box.height / 2 - (top + height / 2) * zoom,
    zoom,
  };
};
export const zoomFlow = (
  current: FlowViewport,
  factor: number,
  box: {
    width: number;
    height: number;
  },
  min: number,
  max: number
): FlowViewport => {
  const zoom = Math.min(Math.max(current.zoom * factor, min), max);
  const ratio = zoom / current.zoom;
  return {
    x: box.width / 2 - (box.width / 2 - current.x) * ratio,
    y: box.height / 2 - (box.height / 2 - current.y) * ratio,
    zoom,
  };
};
export const pinchFlow = (
  initial: FlowViewport,
  focal: {
    x: number;
    y: number;
  },
  scale: number,
  min: number,
  max: number
): FlowViewport => {
  const zoom = Math.min(Math.max(initial.zoom * scale, min), max);
  const ratio = zoom / initial.zoom;
  return {
    x: focal.x - (focal.x - initial.x) * ratio,
    y: focal.y - (focal.y - initial.y) * ratio,
    zoom,
  };
};
export const findFlowTarget = (
  node: string,
  drop: {
    x: number;
    y: number;
  },
  zoom: number,
  rects: Record<string, FlowRect>,
  handles: HandleEntry[]
) => {
  let target: string | null = null;
  let handle: string | undefined;
  let distance = CONNECT_RADIUS / zoom;
  for (const entry of handles) {
    if (entry.node === node || entry.type === "source") {
      continue;
    }
    const rect = rects[entry.node];
    if (!rect) {
      continue;
    }
    const anchor = anchorOf(rect, entry.side, entry.offset);
    const next = Math.hypot(anchor.x - drop.x, anchor.y - drop.y);
    if (next < distance) {
      distance = next;
      target = entry.node;
      handle = entry.id;
    }
  }
  if (target === null) {
    for (const [id, rect] of Object.entries(rects)) {
      if (id === node) {
        continue;
      }
      if (
        drop.x >= rect.x &&
        drop.x <= rect.x + rect.width &&
        drop.y >= rect.y &&
        drop.y <= rect.y + rect.height
      ) {
        target = id;
        handle = undefined;
        break;
      }
    }
  }
  return target === null ? null : { handle, node: target };
};
