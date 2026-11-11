import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useDirection } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { seriesColorAt } from "../../lib/chart-colors";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { ChartAccessibilityData } from "../../primitives/chart-accessibility";
import { createChartGraphicsStore } from "../../primitives/chart-graphics-store";
import { chartLinear, useChartTween } from "../../primitives/chart-tween";
import { useSeriesColor } from "../../theme/use-series-color";
import { LinkAccessibilityData } from "./accessibility";
import { SankeyChartContext, useChart } from "./context";
import { sankeyLayout, transposeLayout } from "./sankey-layout";
import type { SankeyLayoutNode } from "./sankey-layout";
import type { SankeyChartProps, SankeyChartHandle } from "./types";

const GraphicLayer = () => {
  const { graphics, width, height } = useChart("SankeyChart graphics");
  const parts = useSyncExternalStore(
    graphics.subscribe,
    graphics.getSnapshot,
    graphics.getSnapshot
  );
  return (
    <CanvasGraphics
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {parts.map((part) => part.node)}
    </CanvasGraphics>
  );
};
const slotOf = (type: unknown) => {
  const { slot } = type as { slot?: string };
  return slot && ["svg", "overlay", "header", "footer"].includes(slot)
    ? slot
    : "overlay";
};
export const SankeyChartRoot = forwardRef<SankeyChartHandle, SankeyChartProps>(
  (
    {
      nodes,
      links,
      height: heightProp,
      nodeWidth = 10,
      nodePadding = 14,
      orientation = "horizontal",
      collapse,
      align = "justify",
      iterations = 6,
      curve = 0.5,
      color,
      animationDuration = 620,
      staggerDelay = 110,
      status = "ready",
      activeId: controlled,
      onActiveIdChange,
      onDropLinks,
      accessibilityLabel,
      accessibilityHint,
      accessibilityLabelForDatum,
      accessibilityLabelForLink,
      onAccessibilityDatumPress,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const measure = useElementLayout(
      true,
      [className, children],
      undefined,
      false
    );
    const width = Math.round(measure.layout?.width ?? 0);
    const [internal, setInternal] = useState<string | null>(null);
    const activeId = controlled === undefined ? internal : controlled;
    const setActiveId = useCallback(
      (id: string | null) => {
        if (controlled === undefined) {
          setInternal(id);
        }
        onActiveIdChange?.(id);
      },
      [controlled, onActiveIdChange]
    );
    const upright = orientation === "horizontal";
    const stages = useMemo(() => {
      if (upright || heightProp !== undefined) {
        return 0;
      }
      return sankeyLayout(nodes, links, {
        align,
        collapse,
        height: 1000,
        iterations: 0,
        nodePadding,
        nodeWidth,
        width: 1000,
      }).columns;
    }, [
      upright,
      heightProp,
      nodes,
      links,
      nodeWidth,
      nodePadding,
      align,
      collapse,
    ]);
    const height = heightProp ?? (upright ? 240 : Math.max(240, stages * 104));
    const solved = useMemo(() => {
      const layout = sankeyLayout(nodes, links, {
        align,
        collapse,
        height: upright ? height : width,
        iterations,
        nodePadding,
        nodeWidth,
        width: upright ? width : height,
      });
      return upright ? layout : transposeLayout(layout);
    }, [
      nodes,
      links,
      width,
      height,
      nodeWidth,
      nodePadding,
      align,
      iterations,
      collapse,
      upright,
    ]);
    const direction = useDirection();
    const layout = useMemo(
      () =>
        direction === "rtl" && upright
          ? {
              ...solved,
              nodes: solved.nodes.map((node) => ({
                ...node,
                x0: width - node.x1,
                x1: width - node.x0,
              })),
            }
          : solved,
      [solved, direction, upright, width]
    );
    useEffect(() => {
      onDropLinks?.(layout.dropped);
    }, [layout.dropped, onDropLinks]);
    const c1 = useSeriesColor(color, 1);
    const c2 = useSeriesColor(undefined, 2);
    const c3 = useSeriesColor(undefined, 3);
    const c4 = useSeriesColor(undefined, 4);
    const c5 = useSeriesColor(undefined, 5);
    const palette = useMemo(() => [c1, c2, c3, c4, c5], [c1, c2, c3, c4, c5]);
    const colors = useMemo(
      () =>
        layout.nodes.map(
          (node, index) =>
            nodes[node.index]?.color ?? seriesColorAt(palette, index)
        ),
      [layout.nodes, nodes, palette]
    );
    const labelFor = useMemo(() => {
      const names = new Map(
        nodes.map((node) => [node.id, node.label ?? node.id])
      );
      return (id: string) => names.get(id) ?? id;
    }, [nodes]);
    const datumFor = useCallback(
      (node: SankeyLayoutNode) => nodes[node.index] ?? { id: node.id },
      [nodes]
    );
    const stagger = Math.max(0, staggerDelay);
    const columns = Math.max(layout.columns, 1);
    const span = animationDuration + Math.max(columns - 1, 0) * stagger;
    const windows = useMemo(
      () =>
        Array.from({ length: columns }, (_, i) => ({
          from: span > 0 ? (i * stagger) / span : 0,
          to: span > 0 ? (i * stagger + animationDuration) / span : 1,
        })),
      [columns, span, stagger, animationDuration]
    );
    const reduced = usePanelReducedMotion();
    const reveal = useChartTween(0, chartLinear);
    const replay = useCallback(() => {
      reveal.setImmediate(reduced ? 1 : 0);
      if (!reduced) {
        reveal.timingTo(1, span);
      }
    }, [reduced, span, reveal.setImmediate, reveal.timingTo]);
    const revealed = useRef(false);
    useEffect(() => {
      if (status === "loading") {
        revealed.current = false;
        reveal.setImmediate(0);
        return;
      }
      if (!revealed.current && layout.nodes.length) {
        revealed.current = true;
        replay();
      }
    }, [status, layout.nodes.length, replay, reveal.setImmediate]);
    useImperativeHandle(ref, () => ({ replay }), [replay]);
    const [labelledIds, setLabelledIds] = useState<string[] | null>(null);
    const reportLabelled = useCallback(
      (ids: string[] | null) =>
        setLabelledIds((current) => {
          if (current === ids) {
            return current;
          }
          if (current === null || ids === null) {
            return ids;
          }
          return current.length === ids.length &&
            current.every((id, i) => id === ids[i])
            ? current
            : ids;
        }),
      []
    );
    const parts = Children.toArray(children)
      .filter(isValidElement)
      .map((child) => ({
        child,
        name: (child.type as { displayName?: string }).displayName,
        slot: slotOf(child.type),
      }));
    const labelled = parts.some((part) => part.name === "SankeyChart.Labels");
    const spoken = useMemo(() => {
      if (!labelled) {
        return nodes;
      }
      if (labelledIds === null) {
        return [];
      }
      const drawn = new Set(labelledIds);
      return nodes.filter((node) => !drawn.has(node.id));
    }, [nodes, labelled, labelledIds]);
    const [graphics] = useState(createChartGraphicsStore);
    const context = {
      activeId,
      colors,
      curve,
      datumFor,
      graphics,
      height,
      labelFor,
      layout,
      links,
      nodes,
      orientation,
      reportLabelled,
      reveal: reveal.signal,
      setActiveId,
      status,
      width,
      windows,
    };
    const render = (slot: string) =>
      parts.filter((part) => part.slot === slot).map((part) => part.child);
    return (
      <SankeyChartContext.Provider value={context}>
        <View {...props} className={cn("w-full", className)}>
          {render("header")}
          <View
            id={measure.id}
            className="relative w-full"
            style={{ height: `${height * 2}rpx` }}
          >
            {width > 0 && height > 0 ? (
              <>
                <GraphicLayer />
                {render("svg")}
                <View
                  className="absolute top-0 left-0"
                  style={{
                    direction: "ltr",
                    height: `${height * 2}rpx`,
                    pointerEvents: "none",
                    width: `${width * 2}rpx`,
                  }}
                >
                  {render("overlay")}
                </View>
              </>
            ) : null}
          </View>
          {render("footer")}
          <ChartAccessibilityData
            chart="Flow diagram"
            data={spoken}
            disabled={status === "loading" || (labelled && spoken.length === 0)}
            valueOf={(node) => [
              ["Node", node.label ?? node.id],
              [
                "Value",
                layout.nodes.find((placed) => placed.id === node.id)?.value,
              ],
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityLabelForDatum={accessibilityLabelForDatum}
            onAccessibilityDatumPress={onAccessibilityDatumPress}
          />
          <LinkAccessibilityData
            disabled={status === "loading"}
            layout={layout}
            links={links}
            labelFor={labelFor}
            labelForLink={accessibilityLabelForLink}
          />
        </View>
      </SankeyChartContext.Provider>
    );
  }
);
SankeyChartRoot.displayName = "SankeyChart";
