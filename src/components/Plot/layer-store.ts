import { cloneElement, createContext } from "react";
import type { ReactElement, ReactNode } from "react";

import { sortCopy } from "../../lib/sort-copy";
import { createObservableValue } from "../../primitives/observable-value";

interface LayerEntry {
  id: string;
  node: ReactNode;
  path: readonly number[];
  parents: readonly ReactElement[];
}
interface LayerGroup {
  element: ReactElement;
  children: LayerChild[];
  groups: Map<ReactElement, LayerGroup>;
}
type LayerChild = { group: LayerGroup } | { node: ReactNode };
const comparePath = (a: readonly number[], b: readonly number[]) => {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const difference = a[i] - b[i];
    if (difference) {
      return difference;
    }
  }
  return a.length - b.length;
};
const renderChildren = (children: LayerChild[]): ReactNode[] =>
  children.map((child) =>
    "group" in child
      ? cloneElement(
          child.group.element,
          {},
          renderChildren(child.group.children)
        )
      : child.node
  );
const composeGroups = (entries: LayerEntry[]) => {
  const root = {
    children: [] as LayerChild[],
    groups: new Map<ReactElement, LayerGroup>(),
  };
  for (const entry of entries) {
    let owner: Pick<LayerGroup, "children" | "groups"> = root;
    for (const parent of entry.parents) {
      let group = owner.groups.get(parent);
      if (!group) {
        group = { children: [], element: parent, groups: new Map() };
        owner.groups.set(parent, group);
        owner.children.push({ group });
      }
      owner = group;
    }
    owner.children.push({ node: entry.node });
  }
  return renderChildren(root.children);
};
export const createPlotLayerStore = () => {
  const entries = new Map<string, LayerEntry>();
  const state = createObservableValue<readonly ReactNode[]>([]);
  const publish = () => {
    state.value = composeGroups(
      sortCopy([...entries.values()], (a, b) => comparePath(a.path, b.path))
    );
  };
  return {
    getSnapshot: state.getSnapshot,
    remove: (id: string) => {
      if (entries.delete(id)) {
        publish();
      }
    },
    set: (
      id: string,
      node: ReactNode,
      path: readonly number[],
      parents: readonly ReactElement[]
    ) => {
      entries.set(id, { id, node, parents, path });
      publish();
    },
    subscribe: state.subscribe,
  };
};
export type PlotLayerStore = ReturnType<typeof createPlotLayerStore>;
export const PlotLayerRegistryContext = createContext<PlotLayerStore | null>(
  null
);
export const PlotLayerPathContext = createContext<readonly number[]>([]);
export const PlotLayerAncestorsContext = createContext<ReactElement[]>([]);
