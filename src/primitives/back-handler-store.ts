export interface BackHandlerSnapshot {
  active: boolean;
  host: string | null;
}
export class BackHandlerStore {
  private hosts = new Set<string>();
  private handlers = new Map<string, { order: number; handle: () => void }>();
  private listeners = new Set<() => void>();
  private snapshot: BackHandlerSnapshot = { active: false, host: null };
  registerHost = (owner: string) => {
    this.hosts.add(owner);
    this.emit();
    return () => {
      this.hosts.delete(owner);
      this.emit();
    };
  };
  acquire = (owner: string, order: number, handle: () => void) => {
    this.handlers.set(owner, { handle, order });
    this.emit();
    return () => {
      this.handlers.delete(owner);
      this.emit();
    };
  };
  trigger = (): boolean => {
    let top: { order: number; handle: () => void } | undefined;
    for (const entry of this.handlers.values()) {
      if (!top || entry.order > top.order) {
        top = entry;
      }
    }
    if (!top) {
      return false;
    }
    top.handle();
    return true;
  };
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };
  getSnapshot = () => this.snapshot;
  private emit() {
    const active = this.handlers.size > 0;
    const host = this.hosts.values().next().value ?? null;
    if (active === this.snapshot.active && host === this.snapshot.host) {
      return;
    }
    this.snapshot = { active, host };
    for (const listener of this.listeners) {
      listener();
    }
  }
}
