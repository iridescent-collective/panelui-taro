export class SheetSurfaceStore {
  private readonly listeners = new Set<() => void>();
  private readonly bodies = new Set<string>();
  private hold: number | undefined;
  offset = 0;
  get hasBody(): boolean {
    return this.bodies.size > 0;
  }
  getSnapshot = (): number | undefined => this.hold;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  setHold = (offset: number | undefined): void => {
    if (this.hold === offset) {
      return;
    }
    this.hold = offset;
    for (const listener of this.listeners) {
      listener();
    }
  };
  register = (owner: string) => {
    this.bodies.add(owner);
    return () => {
      this.bodies.delete(owner);
      if (this.bodies.size === 0) {
        this.offset = 0;
        this.setHold(undefined);
      }
    };
  };
}
