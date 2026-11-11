import { Canvas } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useChartTween } from "../../primitives/chart-tween";
import { Path, Rect } from "../../primitives/static-svg";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { useChart, useSankeyReveal, useSankeyGraphic } from "./context";
import { progress, flowPath, flowPathVertical } from "./math";
import type { SankeyLayoutNode, SankeyLayoutLink } from "./sankey-layout";
import type { SankeyChartLinksProps, SankeyChartNodesProps } from "./types";

export const ribbonFrame = (input: {
  edgeFrom: number;
  edgeTo: number;
  centreFrom: number;
  centreTo: number;
  thickness: number;
  curve: number;
  upright: boolean;
  windowFrom: number;
  windowTo: number;
  clock: number;
  opacity: number;
}) => ({
  d: (input.upright ? flowPath : flowPathVertical)(
    input.edgeFrom,
    input.centreFrom,
    input.edgeTo,
    input.centreTo,
    input.thickness * progress(input.clock, input.windowFrom, input.windowTo),
    input.curve
  ),
  fillOpacity: input.opacity,
});
export const barFrame = (input: {
  thin0: number;
  thin1: number;
  long0: number;
  long1: number;
  upright: boolean;
  from: number;
  to: number;
  clock: number;
  opacity: number;
}) => {
  const extent = input.long1 - input.long0;
  const centre = (input.long0 + input.long1) / 2;
  const thickness = input.thin1 - input.thin0;
  const grown = extent * progress(input.clock, input.from, input.to);
  const near = centre - grown / 2;
  return input.upright
    ? {
        height: grown,
        opacity: input.opacity,
        width: thickness,
        x: input.thin0,
        y: near,
      }
    : {
        height: thickness,
        opacity: input.opacity,
        width: grown,
        x: near,
        y: input.thin0,
      };
};
const useSelectionOpacity = (opacity: number) => {
  const tween = useChartTween(opacity);
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    if (reduced) {
      tween.setImmediate(opacity);
    } else {
      tween.timingTo(opacity, 180);
    }
  }, [opacity, reduced, tween.setImmediate, tween.timingTo]);
  return useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
};
const Ribbon = ({
  link,
  opacity,
}: {
  link: SankeyLayoutLink;
  opacity: number;
}) => {
  const { layout, links, colors, curve, windows, orientation } =
    useChart("SankeyChart ribbon");
  const clock = useSankeyReveal();
  const settled = useSelectionOpacity(opacity);
  const source = layout.nodes[link.source];
  const target = layout.nodes[link.target];
  const upright = orientation === "horizontal";
  const window = windows[source?.layer ?? 0] ?? { from: 0, to: 1 };
  const fill =
    (link.input >= 0 ? links[link.input]?.color : undefined) ??
    colors[link.source] ??
    colors[0] ??
    "#3b82f6";
  const node = useMemo(
    () =>
      source && target ? (
        <Path
          {...ribbonFrame({
            centreFrom: link.y0,
            centreTo: link.y1,
            clock,
            curve,
            edgeFrom: upright ? source.x1 : source.y1,
            edgeTo: upright ? target.x0 : target.y0,
            opacity: settled,
            thickness: link.width,
            upright,
            windowFrom: window.from,
            windowTo: window.to,
          })}
          fill={fill}
        />
      ) : null,
    [source, target, link, upright, curve, window, clock, settled, fill]
  );
  useSankeyGraphic(node);
  return null;
};
export const SankeyChartLinks = Object.assign(
  ({
    opacity = 0.4,
    activeOpacity = 0.78,
    dimOpacity = 0.08,
  }: SankeyChartLinksProps) => {
    const { layout, status, activeId } = useChart("SankeyChart.Links");
    if (status === "loading" || !layout.links.length) {
      return null;
    }
    return (
      <>
        {layout.links.map((link) => {
          const source = layout.nodes[link.source];
          const target = layout.nodes[link.target];
          if (!source || !target) {
            return null;
          }
          const touching = activeId === source.id || activeId === target.id;
          let alpha = opacity;
          if (activeId !== null) {
            alpha = touching ? activeOpacity : dimOpacity;
          }
          return <Ribbon key={link.index} link={link} opacity={alpha} />;
        })}
      </>
    );
  },
  { displayName: "SankeyChart.Links", slot: "svg" as const }
);
const NodeBar = ({
  node,
  index,
  radius,
  dimOpacity,
}: {
  node: SankeyLayoutNode;
  index: number;
  radius: number;
  dimOpacity: number;
}) => {
  const { colors, windows, orientation, activeId } =
    useChart("SankeyChart node");
  const clock = useSankeyReveal();
  const selected = activeId === node.id;
  const opacity = useSelectionOpacity(
    activeId === null || selected ? 1 : dimOpacity
  );
  const upright = orientation === "horizontal";
  const window = windows[node.layer] ?? windows[0] ?? { from: 0, to: 1 };
  const graphic = useMemo(
    () => (
      <Rect
        {...barFrame({
          clock,
          from: window.from,
          long0: upright ? node.y0 : node.x0,
          long1: upright ? node.y1 : node.x1,
          opacity,
          thin0: upright ? node.x0 : node.y0,
          thin1: upright ? node.x1 : node.y1,
          to: window.to,
          upright,
        })}
        rx={radius}
        fill={colors[index] ?? "#3b82f6"}
      />
    ),
    [node, upright, window, clock, opacity, radius, colors, index]
  );
  useSankeyGraphic(graphic);
  return null;
};
const containsPoint = (
  x: number,
  y: number,
  box: { x: number; y: number; width: number; height: number }
) =>
  x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
export const SankeyChartNodes = Object.assign(
  ({
    radius = 2,
    dimOpacity = 0.25,
    interactive = true,
  }: SankeyChartNodesProps) => {
    const {
      layout,
      windows,
      status,
      activeId,
      setActiveId,
      orientation,
      reveal,
    } = useChart("SankeyChart.Nodes");
    const upright = orientation === "horizontal";
    const tapReset = useMemo(
      () => ({ interactive, layout, status }),
      [layout, status, interactive]
    );
    const pointer = useCanvasTap(
      (x, y) => {
        if (status === "loading" || !interactive) {
          return null;
        }
        for (let i = layout.nodes.length - 1; i >= 0; i -= 1) {
          const node = layout.nodes[i];
          const thin0 = upright ? node.x0 : node.y0;
          const thin1 = upright ? node.x1 : node.y1;
          const long0 = upright ? node.y0 : node.x0;
          const long1 = upright ? node.y1 : node.x1;
          const window = windows[node.layer] ??
            windows[0] ?? { from: 0, to: 1 };
          const frame = barFrame({
            clock: reveal.value,
            from: window.from,
            long0,
            long1,
            opacity: 1,
            thin0,
            thin1,
            to: window.to,
            upright,
          });
          if (containsPoint(x, y, frame)) {
            return node.id;
          }
          if (long1 - long0 < 44) {
            const across = (thin0 + thin1) / 2 - 22;
            const along = (long0 + long1) / 2 - 22;
            const left = upright ? across : along;
            const top = upright ? along : across;
            if (
              containsPoint(x, y, { height: 44, width: 44, x: left, y: top })
            ) {
              return node.id;
            }
          }
        }
        return null;
      },
      (id) => setActiveId(activeId === id ? null : id),
      tapReset
    );
    if (status === "loading" || !layout.nodes.length) {
      return null;
    }
    return (
      <>
        {layout.nodes.map((node, index) => (
          <NodeBar
            key={node.id}
            node={node}
            index={index}
            radius={radius}
            dimOpacity={dimOpacity}
          />
        ))}
        {interactive ? (
          <Canvas
            type="2d"
            aria-hidden
            className="panel-sankey-pointer absolute inset-0 h-full w-full"
            {...pointer}
          />
        ) : null}
      </>
    );
  },
  { displayName: "SankeyChart.Nodes", slot: "svg" as const }
);
