import { Children, Fragment, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { TabsContent } from "./content";
import type { TabsContentProps } from "./types";

export const collectPanels = (children: ReactNode) => {
  const rest: ReactNode[] = [];
  const panels: ReactElement<TabsContentProps>[] = [];
  const walk = (nodes: ReactNode) => {
    for (const child of Children.toArray(nodes)) {
      if (!isValidElement<{ children?: ReactNode }>(child)) {
        rest.push(child);
      } else if (child.type === Fragment) {
        walk(child.props.children);
      } else if (
        child.type === TabsContent &&
        isValidElement<TabsContentProps>(child)
      ) {
        panels.push(child);
      } else {
        rest.push(child);
      }
    }
  };
  walk(children);
  return { panels, rest };
};
