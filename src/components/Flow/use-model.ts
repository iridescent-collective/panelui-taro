import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { createObservableNumber } from "../../primitives/observable-number";
import { createObservableValue } from "../../primitives/observable-value";
import type { FlowAccessibilityNode } from "./flow-accessibility";
import type { FlowRect } from "./flow-paths";
import { fitFlow, flowLayer, zoomFlow } from "./geometry";
import type {
  FlowProps,
  FlowViewport,
  FlowEdgeProps,
  HandleEntry,
  FlowConnection,
} from "./types";

export const useFlowModel = (props: FlowProps) => {
  const {
    defaultViewport,
    minZoom = 0.3,
    maxZoom = 2.5,
    fitViewOnMount = false,
    fitViewPadding = 48,
    onViewportChange,
    onNodeDragEnd,
    onConnect,
    isValidConnection,
  } = props;
  const reduced = usePanelReducedMotion();
  const measured = useElementLayout(true, props.children, props.id, false);
  const [rects] = useState(() =>
    createObservableValue<Record<string, FlowRect>>({})
  );
  const [translateX] = useState(() =>
    createObservableNumber(defaultViewport?.x ?? 0)
  );
  const [translateY] = useState(() =>
    createObservableNumber(defaultViewport?.y ?? 0)
  );
  const [zoom] = useState(() =>
    createObservableNumber(defaultViewport?.zoom ?? 1)
  );
  const [connection] = useState(() =>
    createObservableValue({ active: 0, x1: 0, x2: 0, y1: 0, y2: 0 })
  );
  const [size] = useState(() => createObservableValue({ height: 0, width: 0 }));
  const [locked, setLocked] = useState(false);
  const [nodes, setNodes] = useState<FlowAccessibilityNode[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [handles, setHandles] = useState<HandleEntry[]>([]);
  const [edges, setEdges] = useState<
    {
      key: string;
      props: FlowEdgeProps;
    }[]
  >([]);
  const [boxes, setBoxes] = useState<Record<string, FlowRect>>({});
  const boxesRef = useRef<Record<string, FlowRect>>({});
  const current = useRef({ isValidConnection, onConnect, onViewportChange });
  current.current = { isValidConnection, onConnect, onViewportChange };
  const setNodeRect = useCallback(
    (id: string, patch: Partial<FlowRect>) => {
      const existing = Object.hasOwn(boxesRef.current, id)
        ? boxesRef.current[id]
        : undefined;
      const previous = existing ?? { height: 0, width: 0, x: 0, y: 0 };
      const next = { ...previous, ...patch };
      if (
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height
      ) {
        return;
      }
      const updated = { ...boxesRef.current, [id]: next };
      boxesRef.current = updated;
      rects.value = updated;
      setBoxes(updated);
    },
    [rects]
  );
  const dropNodeRect = useCallback(
    (id: string) => {
      if (!Object.hasOwn(boxesRef.current, id)) {
        return;
      }
      const { [id]: _removed, ...next } = boxesRef.current;
      boxesRef.current = next;
      rects.value = next;
      setBoxes(next);
    },
    [rects]
  );
  const registerNode = useCallback(
    (id: string, label = id) =>
      setNodes((list) => [
        ...list.filter((entry) => entry.id !== id),
        { id, label },
      ]),
    []
  );
  const unregisterNode = useCallback(
    (id: string) => setNodes((list) => list.filter((entry) => entry.id !== id)),
    []
  );
  const registerGroup = useCallback(
    (id: string) =>
      setGroupIds((list) => (list.includes(id) ? list : [...list, id])),
    []
  );
  const unregisterGroup = useCallback(
    (id: string) => setGroupIds((list) => list.filter((entry) => entry !== id)),
    []
  );
  const registerHandle = useCallback(
    (entry: HandleEntry) =>
      setHandles((list) => [
        ...list.filter((item) => item.key !== entry.key),
        entry,
      ]),
    []
  );
  const unregisterHandle = useCallback(
    (key: string) =>
      setHandles((list) => list.filter((item) => item.key !== key)),
    []
  );
  const registerEdge = useCallback(
    (key: string, edge: FlowEdgeProps) =>
      setEdges((list) => [
        ...list.filter((item) => item.key !== key),
        { key, props: edge },
      ]),
    []
  );
  const unregisterEdge = useCallback(
    (key: string) =>
      setEdges((list) => list.filter((item) => item.key !== key)),
    []
  );
  const connectNodes = useCallback((next: FlowConnection) => {
    if (
      current.current.isValidConnection &&
      !current.current.isValidConnection(next)
    ) {
      return;
    }
    current.current.onConnect?.(next);
  }, []);
  const tx = useChartTween(translateX.value, chartCubicOut, (value) => {
    translateX.value = value;
  });
  const ty = useChartTween(translateY.value, chartCubicOut, (value) => {
    translateY.value = value;
  });
  const z = useChartTween(zoom.value, chartCubicOut, (value) => {
    zoom.value = value;
  });
  const immediate = useCallback(
    (next: FlowViewport) => {
      tx.setImmediate(next.x);
      ty.setImmediate(next.y);
      z.setImmediate(next.zoom);
    },
    [tx.setImmediate, ty.setImmediate, z.setImmediate]
  );
  const reportViewport = useCallback(
    (next: FlowViewport) => current.current.onViewportChange?.(next),
    []
  );
  const moveViewport = useCallback(
    (next: FlowViewport) => {
      if (reduced) {
        immediate(next);
      } else {
        tx.timingTo(next.x, 320);
        ty.timingTo(next.y, 320);
        z.timingTo(next.zoom, 320);
      }
      reportViewport(next);
    },
    [reduced, immediate, tx.timingTo, ty.timingTo, z.timingTo, reportViewport]
  );
  const fitView = useCallback(() => {
    const next = fitFlow(
      rects.value,
      size.value,
      fitViewPadding,
      minZoom,
      maxZoom
    );
    if (next) {
      moveViewport(next);
    }
  }, [rects, size, fitViewPadding, minZoom, maxZoom, moveViewport]);
  const zoomBy = useCallback(
    (factor: number) => {
      const viewport = {
        x: translateX.value,
        y: translateY.value,
        zoom: zoom.value,
      };
      const next = zoomFlow(viewport, factor, size.value, minZoom, maxZoom);
      if (next.zoom !== viewport.zoom) {
        moveViewport(next);
      }
    },
    [translateX, translateY, zoom, size, minZoom, maxZoom, moveViewport]
  );
  const box = useMemo(
    () => ({
      height: measured.layout?.height ?? 0,
      width: measured.layout?.width ?? 0,
    }),
    [measured.layout?.width, measured.layout?.height]
  );
  useEffect(() => {
    size.value = box;
  }, [box, size]);
  const layer = useMemo(() => flowLayer(boxes, box), [boxes, box]);
  const origin = useMemo(
    () => ({ x: layer.width / 2, y: layer.height / 2 }),
    [layer]
  );
  const fitOnMount = useRef(fitViewOnMount);
  useEffect(() => {
    if (!fitOnMount.current || nodes.length === 0) {
      return;
    }
    const timer = setTimeout(fitView, 32);
    return () => clearTimeout(timer);
  }, [fitView, nodes.length]);
  const context = useMemo(
    () => ({
      box,
      boxes,
      canConnect: Boolean(onConnect),
      connectNodes,
      connection,
      dropNodeRect,
      edges,
      fitView,
      groupIds,
      handles,
      layer,
      locked,
      maxZoom,
      minZoom,
      nodes,
      onNodeDragEnd,
      origin,
      rects,
      registerEdge,
      registerGroup,
      registerHandle,
      registerNode,
      setLocked,
      setNodeRect,
      size,
      translateX,
      translateY,
      unregisterEdge,
      unregisterGroup,
      unregisterHandle,
      unregisterNode,
      zoom,
      zoomBy,
    }),
    [
      rects,
      boxes,
      setNodeRect,
      dropNodeRect,
      translateX,
      translateY,
      zoom,
      connection,
      size,
      box,
      layer,
      origin,
      minZoom,
      maxZoom,
      locked,
      nodes,
      groupIds,
      handles,
      edges,
      registerNode,
      unregisterNode,
      registerGroup,
      unregisterGroup,
      registerHandle,
      unregisterHandle,
      registerEdge,
      unregisterEdge,
      connectNodes,
      onConnect,
      onNodeDragEnd,
      fitView,
      zoomBy,
    ]
  );
  return {
    context,
    id: measured.id,
    immediate,
    layout: measured.layout,
    reportViewport,
  };
};
