import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

export const MAP_LAYER = Symbol.for("panelui.map.layer");
interface Layer {
  [MAP_LAYER]?: true;
}
export const asMapLayer = <T>(
  part: T
): T & {
  displayName?: string;
} => {
  (part as T & Layer)[MAP_LAYER] = true;
  return part as T & {
    displayName?: string;
  };
};
export const isMapLayer = (type: unknown): boolean =>
  (typeof type === "function" || typeof type === "object") &&
  type !== null &&
  (type as Layer)[MAP_LAYER] === true;
export interface PartitionedMapChildren {
  layers: ReactNode[];
  overlay: ReactNode[];
}
export const partitionMapChildren = (
  children: ReactNode
): PartitionedMapChildren => {
  const layers: ReactNode[] = [];
  const overlay: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && isMapLayer(child.type)) {
      layers.push(child);
    } else if (child !== null && child !== undefined && child !== false) {
      overlay.push(child);
    }
  });
  return { layers, overlay };
};
