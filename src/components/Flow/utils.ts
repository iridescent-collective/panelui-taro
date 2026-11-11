import { Fragment } from "react";
import type { ReactNode } from "react";

import { resolveFlowEndpoint } from "./flow-identifiers";
import type { FlowEndpointReference } from "./flow-identifiers";
import type { FlowSide } from "./flow-paths";
import type { HandleEntry } from "./types";

type FlowSlot = "background" | "overlay";
export const splitChildren = (
  children: ReactNode
): {
  background: ReactNode[];
  overlay: ReactNode[];
  canvas: ReactNode[];
} => {
  const background: ReactNode[] = [];
  const overlay: ReactNode[] = [];
  const canvas: ReactNode[] = [];
  const visit = (node: ReactNode) => {
    if (node === null || node === undefined || typeof node === "boolean") {
      return;
    }
    if (Array.isArray(node)) {
      for (const entry of node) {
        visit(entry);
      }
      return;
    }
    if (typeof node === "object" && "type" in node) {
      const { type } = node as {
        type: unknown;
      };
      const slot =
        typeof type === "function"
          ? (
              type as {
                slot?: FlowSlot;
              }
            ).slot
          : undefined;
      if (slot === "background") {
        background.push(node);
        return;
      }
      if (slot === "overlay") {
        overlay.push(node);
        return;
      }
      if (type === Fragment) {
        visit(
          (
            node as {
              props?: {
                children?: ReactNode;
              };
            }
          ).props?.children
        );
        return;
      }
    }
    canvas.push(node);
  };
  visit(children);
  return { background, canvas, overlay };
};
export const resolveEnd = (
  reference: FlowEndpointReference,
  explicit: FlowSide | undefined,
  nodes: string[],
  handles: HandleEntry[]
): {
  node: string;
  side: FlowSide | undefined;
  offset: number;
} => {
  const endpoint = resolveFlowEndpoint(reference, nodes, handles);
  const entry =
    endpoint.handle === undefined
      ? undefined
      : handles.find(
          (handle) =>
            handle.node === endpoint.node && handle.id === endpoint.handle
        );
  return {
    node: endpoint.node,
    offset: entry?.offset ?? 0.5,
    side: explicit ?? entry?.side,
  };
};
export const collectNodeIds = (children: ReactNode): string[] => {
  const ids: string[] = [];
  const visit = (child: ReactNode) => {
    if (Array.isArray(child)) {
      for (const entry of child) {
        visit(entry);
      }
      return;
    }
    if (!child || typeof child !== "object" || !("props" in child)) {
      return;
    }
    const element = child as {
      type: unknown;
      props: { id?: unknown; children?: ReactNode };
    };
    if (element.type === Fragment) {
      visit(element.props.children);
      return;
    }
    if (typeof element.props.id === "string") {
      ids.push(element.props.id);
    }
  };
  visit(children);
  return ids;
};
