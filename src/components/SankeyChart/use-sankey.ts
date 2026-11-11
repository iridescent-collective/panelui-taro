import { useMemo } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { useChart } from "./context";
import type { SankeyChartFlow } from "./types";

export const useSankeyChart = () => {
  const { nodes, layout, activeId, colors, labelFor } =
    useChart("useSankeyChart");
  return useMemo(() => {
    const placed = activeId
      ? layout.nodes.find((node) => node.id === activeId)
      : undefined;
    if (!placed) {
      return {
        activeId: null,
        activeNode: null,
        activeValue: 0,
        collapsed: null as string[] | null,
        incoming: 0,
        outgoing: 0,
        sources: [] as SankeyChartFlow[],
        targets: [] as SankeyChartFlow[],
      };
    }
    const position = layout.nodes.indexOf(placed);
    let incoming = 0;
    let outgoing = 0;
    const sources: SankeyChartFlow[] = [];
    const targets: SankeyChartFlow[] = [];
    const flow = (at: number, value: number): SankeyChartFlow | null => {
      const other = layout.nodes[at];
      if (!other) {
        return null;
      }
      return {
        color: colors[at] ?? colors[0] ?? "#3b82f6",
        id: other.id,
        label: labelFor(other.id),
        share: placed.value > 0 ? value / placed.value : 0,
        value,
      };
    };
    for (const link of layout.links) {
      if (link.target === position) {
        incoming += link.value;
        const row = flow(link.source, link.value);
        if (row) {
          sources.push(row);
        }
      }
      if (link.source === position) {
        outgoing += link.value;
        const row = flow(link.target, link.value);
        if (row) {
          targets.push(row);
        }
      }
    }
    return {
      activeId,
      activeNode: nodes[placed.index] ?? { id: placed.id },
      activeValue: placed.value,
      collapsed: placed.collapsed ?? null,
      incoming,
      outgoing,
      sources: sortCopy(sources, (a, b) => b.value - a.value),
      targets: sortCopy(targets, (a, b) => b.value - a.value),
    };
  }, [nodes, layout, activeId, colors, labelFor]);
};
