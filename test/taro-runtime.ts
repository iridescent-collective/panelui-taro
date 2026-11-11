export const document = {
  getElementById: (id: string) => globalThis.document?.getElementById(id),
  querySelector: (selector: string) =>
    globalThis.document?.querySelector(selector),
};
export class MutationObserver {
  private observer: globalThis.MutationObserver;
  constructor(listener: () => void) {
    this.observer = new globalThis.MutationObserver(listener);
  }
  observe(element: Node, options: MutationObserverInit) {
    this.observer.observe(element, options);
  }
  disconnect() {
    this.observer.disconnect();
  }
}
