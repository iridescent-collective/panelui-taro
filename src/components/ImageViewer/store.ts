import type { ViewerItem } from "./types";

export class ViewerStore {
  private items = new Map<string, ViewerItem>();
  private listeners = new Set<() => void>();
  private counter = 0;
  private version = 0;
  private sorted: ViewerItem[] = [];
  nextOrder = () => {
    const next = this.counter;
    this.counter += 1;
    return next;
  };
  set = (item: ViewerItem) => {
    this.items.set(item.id, item);
    this.emit();
  };
  delete = (id: string) => {
    if (this.items.delete(id)) {
      this.emit();
    }
  };
  list = () => this.sorted;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.version;
  private emit() {
    this.version += 1;
    const sorted: ViewerItem[] = [];
    for (const item of this.items.values()) {
      const at = sorted.findIndex(
        (existing) =>
          (existing.index ?? existing.order) > (item.index ?? item.order)
      );
      if (at === -1) {
        sorted.push(item);
      } else {
        sorted.splice(at, 0, item);
      }
    }
    this.sorted = sorted;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
