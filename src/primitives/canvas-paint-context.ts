import { getCurrentInstance } from "@tarojs/taro";
import { createContext, useContext, useSyncExternalStore } from "react";

import { OverlayOrderContext } from "./back-handler-context";

/** Native Canvas bitmaps must yield to higher, still-mounted portal layers. */
export type PortalPriority = "normal" | "feedback";
export class CanvasPaintStack {
  private layers = new Map<number, number>();
  private feedbackLayers = new Map<number, number>();
  private listeners = new Set<() => void>();
  private highest = 0;
  private highestNormal = 0;
  getSnapshot = () => this.highest;
  getNormalSnapshot = () => this.highestNormal;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  acquire(order: number, priority: PortalPriority = "normal") {
    const layers = priority === "feedback" ? this.feedbackLayers : this.layers;
    layers.set(order, (layers.get(order) ?? 0) + 1);
    this.publish();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const count = layers.get(order) ?? 0;
      if (count <= 1) layers.delete(order);
      else layers.set(order, count - 1);
      this.publish();
    };
  }
  private publish() {
    const normal = Math.max(0, ...this.layers.keys());
    const highest = this.feedbackLayers.size
      ? Math.max(normal, ...this.feedbackLayers.keys()) + 0.5
      : normal;
    if (highest === this.highest && normal === this.highestNormal) return;
    this.highest = highest;
    this.highestNormal = normal;
    for (const listener of this.listeners) listener();
  }
}
const pages = new WeakMap<object, CanvasPaintStack>();
const fallbackScope = {};
export const pageCanvasPaintStack = () => {
  const page = getCurrentInstance().page ?? fallbackScope;
  let stack = pages.get(page);
  if (!stack) {
    stack = new CanvasPaintStack();
    pages.set(page, stack);
  }
  return stack;
};
export const CanvasPaintActiveContext = createContext(true);
export const CanvasPaintContext = createContext<CanvasPaintStack | null>(null);
const idleSubscribe = () => () => {};
const emptyStack = () => 0;
export const useCanvasPaintOccluded = () => {
  const stack = useContext(CanvasPaintContext);
  const owner = useContext(OverlayOrderContext) ?? 0;
  const active = useContext(CanvasPaintActiveContext);
  const highest = useSyncExternalStore(
    stack?.subscribe ?? idleSubscribe,
    stack?.getSnapshot ?? emptyStack,
    emptyStack
  );
  return !active || highest > owner;
};
