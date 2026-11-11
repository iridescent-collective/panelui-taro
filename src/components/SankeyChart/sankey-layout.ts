import { sortCopy } from "../../lib/sort-copy";

export type SankeyAlign = "justify" | "left" | "right" | "center";
export interface SankeyLayoutNodeInput {
  id: string;
  value?: number;
}
export interface SankeyLayoutLinkInput {
  source: string;
  target: string;
  value: number;
}
export interface SankeyCollapse {
  maxPerColumn?: number;
  minShare?: number;
  label?: string;
}
export interface SankeyLayoutOptions {
  width: number;
  height: number;
  nodeWidth: number;
  nodePadding: number;
  align: SankeyAlign;
  iterations: number;
  collapse?: SankeyCollapse;
}
export interface SankeyLayoutNode {
  id: string;
  index: number;
  collapsed?: string[];
  layer: number;
  value: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}
export interface SankeyLayoutLink {
  index: number;
  input: number;
  source: number;
  target: number;
  value: number;
  width: number;
  y0: number;
  y1: number;
}
export interface SankeyLayout {
  nodes: SankeyLayoutNode[];
  links: SankeyLayoutLink[];
  columns: number;
  dropped: number;
}
interface Node {
  id: string;
  index: number;
  slot: number;
  fixedValue: number | undefined;
  value: number;
  depth: number;
  toSink: number;
  layer: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  sourceLinks: Link[];
  targetLinks: Link[];
}
interface Link {
  index: number;
  input: number;
  source: Node;
  target: Node;
  value: number;
  width: number;
  y0: number;
  y1: number;
}
const sortMutable = <T>(items: T[], compare: (a: T, b: T) => number) => {
  const sorted = sortCopy(items, compare);
  for (const [index, item] of sorted.entries()) {
    items[index] = item;
  }
};
const EMPTY: SankeyLayout = { columns: 0, dropped: 0, links: [], nodes: [] };
const MAX_SANKEY_ITERATIONS = 64;
const validateSankeyIterations = (iterations: number) => {
  if (
    !Number.isFinite(iterations) ||
    iterations < 0 ||
    iterations > MAX_SANKEY_ITERATIONS
  ) {
    throw new RangeError(
      `SankeyChart iterations must be a finite number between 0 and ${MAX_SANKEY_ITERATIONS}`
    );
  }
  return Math.floor(iterations);
};
const MAX_PADDING_SHARE = 0.5;
const ascendingBreadth = (a: Node, b: Node): number => a.y0 - b.y0;
const ascendingSourceBreadth = (a: Link, b: Link): number =>
  ascendingBreadth(a.source, b.source) || a.index - b.index;
const ascendingTargetBreadth = (a: Link, b: Link): number =>
  ascendingBreadth(a.target, b.target) || a.index - b.index;
const sumValues = (links: Link[]): number => {
  let total = 0;
  for (const link of links) {
    total += link.value;
  }
  return total;
};
const withoutCycles = (
  nodes: Node[],
  links: Link[]
): {
  kept: Link[];
  dropped: number;
} => {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const state = new Uint8Array(nodes.length);
  const back = new Set<number>();
  for (const root of nodes) {
    if (state[root.slot] !== WHITE) {
      continue;
    }
    const stack: {
      node: Node;
      cursor: number;
    }[] = [{ cursor: 0, node: root }];
    state[root.slot] = GREY;
    while (stack.length) {
      const frame = stack.at(-1);
      if (!frame) {
        break;
      }
      const outgoing = frame.node.sourceLinks;
      if (frame.cursor >= outgoing.length) {
        state[frame.node.slot] = BLACK;
        stack.pop();
        continue;
      }
      const link = outgoing[frame.cursor];
      frame.cursor += 1;
      if (back.has(link.index)) {
        continue;
      }
      const next = link.target;
      if (state[next.slot] === GREY) {
        back.add(link.index);
      } else if (state[next.slot] === WHITE) {
        state[next.slot] = GREY;
        stack.push({ cursor: 0, node: next });
      }
    }
  }
  if (!back.size) {
    return { dropped: 0, kept: links };
  }
  return {
    dropped: back.size,
    kept: links.filter((link) => !back.has(link.index)),
  };
};
const computeDepths = (nodes: Node[]): void => {
  let current = new Set(nodes);
  let next = new Set<Node>();
  let x = 0;
  while (current.size) {
    for (const node of current) {
      node.depth = x;
      for (const link of node.sourceLinks) {
        next.add(link.target);
      }
    }
    x += 1;
    if (x > nodes.length) {
      break;
    }
    current = next;
    next = new Set();
  }
};
const computeToSink = (nodes: Node[]): void => {
  let current = new Set(nodes);
  let next = new Set<Node>();
  let x = 0;
  while (current.size) {
    for (const node of current) {
      node.toSink = x;
      for (const link of node.targetLinks) {
        next.add(link.source);
      }
    }
    x += 1;
    if (x > nodes.length) {
      break;
    }
    current = next;
    next = new Set();
  }
};
const layerOf = (node: Node, columns: number, align: SankeyAlign): number => {
  switch (align) {
    case "left": {
      return node.depth;
    }
    case "right": {
      return columns - 1 - node.toSink;
    }
    case "center": {
      if (node.targetLinks.length) {
        return node.depth;
      }
      if (!node.sourceLinks.length) {
        return 0;
      }
      let least = Infinity;
      for (const link of node.sourceLinks) {
        least = Math.min(least, link.target.depth);
      }
      return least - 1;
    }
    default: {
      return node.sourceLinks.length ? node.depth : columns - 1;
    }
  }
};
const targetTop = (source: Node, target: Node, padding: number): number => {
  let y = source.y0 - ((source.sourceLinks.length - 1) * padding) / 2;
  for (const link of source.sourceLinks) {
    if (link.target === target) {
      break;
    }
    y += link.width + padding;
  }
  for (const link of target.targetLinks) {
    if (link.source === source) {
      break;
    }
    y -= link.width;
  }
  return y;
};
const sourceTop = (source: Node, target: Node, padding: number): number => {
  let y = target.y0 - ((target.targetLinks.length - 1) * padding) / 2;
  for (const link of target.targetLinks) {
    if (link.source === source) {
      break;
    }
    y += link.width + padding;
  }
  for (const link of source.sourceLinks) {
    if (link.target === target) {
      break;
    }
    y -= link.width;
  }
  return y;
};
const reorderNodeLinks = (node: Node): void => {
  for (const link of node.targetLinks) {
    sortMutable(link.source.sourceLinks, ascendingTargetBreadth);
  }
  for (const link of node.sourceLinks) {
    sortMutable(link.target.targetLinks, ascendingSourceBreadth);
  }
};
const resolveDown = (
  column: Node[],
  y: number,
  from: number,
  alpha: number,
  padding: number
): void => {
  let edge = y;
  for (let i = from; i < column.length; i += 1) {
    const node = column[i];
    const shift = (edge - node.y0) * alpha;
    if (shift > 1e-6) {
      node.y0 += shift;
      node.y1 += shift;
    }
    edge = node.y1 + padding;
  }
};
const resolveUp = (
  column: Node[],
  y: number,
  from: number,
  alpha: number,
  padding: number
): void => {
  let edge = y;
  for (let i = from; i >= 0; i -= 1) {
    const node = column[i];
    const shift = (node.y1 - edge) * alpha;
    if (shift > 1e-6) {
      node.y0 -= shift;
      node.y1 -= shift;
    }
    edge = node.y0 - padding;
  }
};
const resolveCollisions = (
  column: Node[],
  alpha: number,
  padding: number,
  height: number
): void => {
  const middle = Math.floor(column.length / 2);
  const pivot = column[middle];
  if (!pivot) {
    return;
  }
  resolveUp(column, pivot.y0 - padding, middle - 1, alpha, padding);
  resolveDown(column, pivot.y1 + padding, middle + 1, alpha, padding);
  resolveUp(column, height, column.length - 1, alpha, padding);
  resolveDown(column, 0, 0, alpha, padding);
};
const bucketId = (label: string, taken: Set<string>, layer: number): string => {
  if (!taken.has(label)) {
    return label;
  }
  let candidate = `${label} (${layer + 1})`;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${label} (${layer + 1}.${n})`;
    n += 1;
  }
  return candidate;
};
interface CollapsePlan {
  nodes: SankeyLayoutNodeInput[];
  links: SankeyLayoutLinkInput[];
  buckets: Map<string, string[]>;
  origin: Map<string, number>;
  linkOrigin: number[];
}
const columnBuckets = (
  layout: SankeyLayout,
  label: string,
  maxPerColumn: number,
  minShare: number
) => {
  const byLayer = new Map<number, SankeyLayoutNode[]>();
  for (const node of layout.nodes) {
    const column = byLayer.get(node.layer);
    if (column) {
      column.push(node);
    } else {
      byLayer.set(node.layer, [node]);
    }
  }
  const folded = new Map<string, string>();
  const buckets = new Map<string, string[]>();
  const taken = new Set(layout.nodes.map((node) => node.id));
  for (const [layer, column] of byLayer) {
    if (column.length < 2) {
      continue;
    }
    let total = 0;
    for (const node of column) {
      total += node.value;
    }
    if (!(total > 0)) {
      continue;
    }
    const ranked = sortCopy(
      column,
      (a, b) => b.value - a.value || a.id.localeCompare(b.id)
    );
    const doomed = new Set<string>();
    if (minShare > 0) {
      for (const node of ranked) {
        if (node.value / total < minShare) {
          doomed.add(node.id);
        }
      }
    }
    if (ranked.length > maxPerColumn) {
      for (const node of ranked.slice(Math.max(0, maxPerColumn - 1))) {
        doomed.add(node.id);
      }
    }
    if (doomed.size < 2) {
      continue;
    }
    const id = bucketId(label, taken, layer);
    taken.add(id);
    const members = ranked
      .filter((node) => doomed.has(node.id))
      .map((node) => node.id);
    buckets.set(id, members);
    for (const member of members) {
      folded.set(member, id);
    }
  }
  return { buckets, folded };
};
const collapsedNodes = (
  nodeInput: readonly SankeyLayoutNodeInput[],
  folded: Map<string, string>
) => {
  const origin = new Map<string, number>();
  const nodes: SankeyLayoutNodeInput[] = [];
  const emitted = new Set<string>();
  for (const [index, input] of nodeInput.entries()) {
    const bucket = folded.get(input.id);
    if (bucket === undefined) {
      if (emitted.has(input.id)) {
        continue;
      }
      emitted.add(input.id);
      nodes.push(input);
      origin.set(input.id, index);
      continue;
    }
    if (emitted.has(bucket)) {
      continue;
    }
    emitted.add(bucket);
    nodes.push({ id: bucket });
    origin.set(bucket, -1);
  }
  return { nodes, origin };
};
const collapsedLinks = (
  linkInput: readonly SankeyLayoutLinkInput[],
  folded: Map<string, string>,
  origin: Map<string, number>
) => {
  const rename = (id: string) => folded.get(id) ?? id;
  const links: SankeyLayoutLinkInput[] = [];
  const linkOrigin: number[] = [];
  const mergedAt = new Map<string, number>();
  for (const [index, row] of linkInput.entries()) {
    const source = rename(row.source);
    const target = rename(row.target);
    const usable =
      origin.has(source) &&
      origin.has(target) &&
      source !== target &&
      typeof row.value === "number" &&
      Number.isFinite(row.value) &&
      row.value > 0;
    if (!usable) {
      if (
        folded.has(row.source) &&
        folded.has(row.target) &&
        source === target
      ) {
        continue;
      }
      links.push(row);
      linkOrigin.push(index);
      continue;
    }
    const key = `${source}\u0000${target}`;
    const at = mergedAt.get(key);
    if (at === undefined) {
      mergedAt.set(key, links.length);
      links.push({ source, target, value: row.value });
      linkOrigin.push(index);
      continue;
    }
    links[at] = { source, target, value: links[at].value + row.value };
    linkOrigin[at] = -1;
  }
  return { linkOrigin, links };
};
const planCollapse = (
  layout: SankeyLayout,
  nodeInput: readonly SankeyLayoutNodeInput[],
  linkInput: readonly SankeyLayoutLinkInput[],
  collapse: SankeyCollapse
): CollapsePlan | null => {
  const label = collapse.label ?? "Other";
  const maxPerColumn =
    typeof collapse.maxPerColumn === "number" && collapse.maxPerColumn >= 1
      ? Math.floor(collapse.maxPerColumn)
      : Infinity;
  const minShare =
    typeof collapse.minShare === "number" && collapse.minShare > 0
      ? collapse.minShare
      : 0;
  if (maxPerColumn === Infinity && minShare === 0) {
    return null;
  }
  const { folded, buckets } = columnBuckets(
    layout,
    label,
    maxPerColumn,
    minShare
  );
  if (!buckets.size) {
    return null;
  }
  const { nodes, origin } = collapsedNodes(nodeInput, folded);
  const { links, linkOrigin } = collapsedLinks(linkInput, folded, origin);
  return { buckets, linkOrigin, links, nodes, origin };
};
export const transposeLayout = (layout: SankeyLayout): SankeyLayout => ({
  ...layout,
  links: layout.links.map((link) => ({ ...link })),
  nodes: layout.nodes.map((node) => ({
    ...node,
    x0: node.y0,
    x1: node.y1,
    y0: node.x0,
    y1: node.x1,
  })),
});
const createGraph = (
  nodeInput: readonly SankeyLayoutNodeInput[],
  linkInput: readonly SankeyLayoutLinkInput[]
) => {
  const nodes: Node[] = [];
  const byId = new Map<string, Node>();
  for (const [index, input] of nodeInput.entries()) {
    if (byId.has(input.id)) {
      continue;
    }
    const node: Node = {
      depth: 0,
      fixedValue:
        typeof input.value === "number" &&
        Number.isFinite(input.value) &&
        input.value >= 0
          ? input.value
          : undefined,
      id: input.id,
      index,
      layer: 0,
      slot: nodes.length,
      sourceLinks: [],
      targetLinks: [],
      toSink: 0,
      value: 0,
      x0: 0,
      x1: 0,
      y0: 0,
      y1: 0,
    };
    nodes.push(node);
    byId.set(input.id, node);
  }
  let dropped = 0;
  const links: Link[] = [];
  for (const [inputIndex, input] of linkInput.entries()) {
    const source = byId.get(input.source);
    const target = byId.get(input.target);
    const { value } = input;
    if (!source || !target || source === target) {
      dropped += 1;
      continue;
    }
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      dropped += 1;
      continue;
    }
    links.push({
      index: links.length,
      input: inputIndex,
      source,
      target,
      value,
      width: 0,
      y0: 0,
      y1: 0,
    });
  }
  for (const link of links) {
    link.source.sourceLinks.push(link);
    link.target.targetLinks.push(link);
  }
  const cut = withoutCycles(nodes, links);
  if (cut.dropped) {
    dropped += cut.dropped;
    for (const node of nodes) {
      node.sourceLinks = [];
      node.targetLinks = [];
    }
    for (const [index, link] of cut.kept.entries()) {
      link.index = index;
      link.source.sourceLinks.push(link);
      link.target.targetLinks.push(link);
    }
  }
  const { kept } = cut;
  return { dropped, kept, nodes };
};
const createColumns = (
  nodes: Node[],
  width: number,
  nodeWidth: number,
  align: SankeyAlign
) => {
  for (const node of nodes) {
    node.value =
      node.fixedValue ??
      Math.max(sumValues(node.sourceLinks), sumValues(node.targetLinks));
  }
  computeDepths(nodes);
  computeToSink(nodes);
  let columnCount = 0;
  for (const node of nodes) {
    columnCount = Math.max(columnCount, node.depth);
  }
  columnCount += 1;
  const columns: Node[][] = Array.from({ length: columnCount }, () => []);
  const kx = columnCount > 1 ? (width - nodeWidth) / (columnCount - 1) : 0;
  for (const node of nodes) {
    const layer = Math.max(
      0,
      Math.min(columnCount - 1, Math.floor(layerOf(node, columnCount, align)))
    );
    node.layer = layer;
    node.x0 = layer * kx;
    node.x1 = node.x0 + nodeWidth;
    columns[layer].push(node);
  }
  return { columnCount, columns };
};
const measureScale = (
  columns: Node[][],
  height: number,
  requestedPadding: number
) => {
  let tallest = 0;
  for (const column of columns) {
    tallest = Math.max(tallest, column.length);
  }
  const padding =
    tallest > 1
      ? Math.min(requestedPadding, (height * MAX_PADDING_SHARE) / (tallest - 1))
      : requestedPadding;
  let ky = Infinity;
  for (const column of columns) {
    if (!column.length) {
      continue;
    }
    let total = 0;
    for (const node of column) {
      total += node.value;
    }
    if (total <= 0) {
      continue;
    }
    ky = Math.min(ky, (height - (column.length - 1) * padding) / total);
  }
  return { ky, padding };
};
const initializeColumns = (
  columns: Node[][],
  height: number,
  padding: number,
  ky: number
) => {
  for (const column of columns) {
    let y = 0;
    for (const node of column) {
      node.y0 = y;
      node.y1 = y + node.value * ky;
      y = node.y1 + padding;
      for (const link of node.sourceLinks) {
        link.width = link.value * ky;
      }
    }
    const slack = (height - y + padding) / (column.length + 1);
    for (const [i, node] of column.entries()) {
      node.y0 += slack * (i + 1);
      node.y1 += slack * (i + 1);
    }
    for (const node of column) {
      sortMutable(node.sourceLinks, ascendingTargetBreadth);
      sortMutable(node.targetLinks, ascendingSourceBreadth);
    }
  }
};
const relaxColumns = (
  columns: Node[][],
  columnCount: number,
  iterations: number,
  height: number,
  padding: number
) => {
  const rounds = iterations;
  for (let i = 0; i < rounds; i += 1) {
    const alpha = 0.99 ** i;
    const beta = Math.max(1 - alpha, (i + 1) / rounds);
    for (let c = columnCount - 2; c >= 0; c -= 1) {
      const column = columns[c];
      for (const node of column) {
        let weighted = 0;
        let weight = 0;
        for (const link of node.sourceLinks) {
          const span = link.value * (link.target.layer - node.layer);
          weighted += sourceTop(node, link.target, padding) * span;
          weight += span;
        }
        if (!(weight > 0)) {
          continue;
        }
        const shift = (weighted / weight - node.y0) * alpha;
        node.y0 += shift;
        node.y1 += shift;
        reorderNodeLinks(node);
      }
      sortMutable(column, ascendingBreadth);
      resolveCollisions(column, beta, padding, height);
    }
    for (let c = 1; c < columnCount; c += 1) {
      const column = columns[c];
      for (const node of column) {
        let weighted = 0;
        let weight = 0;
        for (const link of node.targetLinks) {
          const span = link.value * (node.layer - link.source.layer);
          weighted += targetTop(link.source, node, padding) * span;
          weight += span;
        }
        if (!(weight > 0)) {
          continue;
        }
        const shift = (weighted / weight - node.y0) * alpha;
        node.y0 += shift;
        node.y1 += shift;
        reorderNodeLinks(node);
      }
      sortMutable(column, ascendingBreadth);
      resolveCollisions(column, beta, padding, height);
    }
  }
};
const serializeLayout = (
  nodes: Node[],
  kept: Link[],
  columnCount: number,
  dropped: number
): SankeyLayout => {
  for (const node of nodes) {
    let out = node.y0;
    for (const link of node.sourceLinks) {
      link.y0 = out + link.width / 2;
      out += link.width;
    }
    let into = node.y0;
    for (const link of node.targetLinks) {
      link.y1 = into + link.width / 2;
      into += link.width;
    }
  }
  const order = new Map(nodes.map((node, i) => [node, i]));
  return {
    columns: columnCount,
    dropped,
    links: kept.map((link, index) => ({
      index,
      input: link.input,
      source: order.get(link.source) ?? 0,
      target: order.get(link.target) ?? 0,
      value: link.value,
      width: link.width,
      y0: link.y0,
      y1: link.y1,
    })),
    nodes: nodes.map((node) => ({
      id: node.id,
      index: node.index,
      layer: node.layer,
      value: node.value,
      x0: node.x0,
      x1: node.x1,
      y0: node.y0,
      y1: node.y1,
    })),
  };
};
export const sankeyLayout = (
  nodeInput: readonly SankeyLayoutNodeInput[],
  linkInput: readonly SankeyLayoutLinkInput[],
  options: SankeyLayoutOptions
): SankeyLayout => {
  const { width, height, align } = options;
  const iterations = validateSankeyIterations(options.iterations);
  const nodeWidth = Math.max(0, options.nodeWidth);
  const requestedPadding = Math.max(0, options.nodePadding);
  if (!nodeInput.length || !(width > 0) || !(height > 0)) {
    return EMPTY;
  }
  if (options.collapse) {
    const bare = { ...options, collapse: undefined };
    const first = sankeyLayout(nodeInput, linkInput, bare);
    const plan = planCollapse(first, nodeInput, linkInput, options.collapse);
    if (plan) {
      const second = sankeyLayout(plan.nodes, plan.links, bare);
      return {
        ...second,
        dropped: first.dropped,
        links: second.links.map((link) => ({
          ...link,
          input: plan.linkOrigin[link.input] ?? -1,
        })),
        nodes: second.nodes.map((node) => {
          const members = plan.buckets.get(node.id);
          return {
            ...node,
            index: plan.origin.get(node.id) ?? -1,
            ...(members ? { collapsed: members } : {}),
          };
        }),
      };
    }
  }
  const { nodes, kept, dropped } = createGraph(nodeInput, linkInput);
  const { columns, columnCount } = createColumns(
    nodes,
    width,
    nodeWidth,
    align
  );
  const { padding, ky } = measureScale(columns, height, requestedPadding);
  if (!Number.isFinite(ky) || ky <= 0) {
    return { ...EMPTY, columns: columnCount, dropped };
  }
  initializeColumns(columns, height, padding, ky);
  relaxColumns(columns, columnCount, iterations, height, padding);
  return serializeLayout(nodes, kept, columnCount, dropped);
};
