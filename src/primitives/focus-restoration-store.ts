interface FocusDocument {
  activeElement?: FocusTarget | null;
  body?: FocusTarget | null;
  documentElement?: FocusTarget | null;
}
interface FocusTarget {
  disabled?: boolean;
  isConnected?: boolean;
  focus: (options?: { preventScroll?: boolean }) => void;
  getAttribute?: (name: string) => string | null;
}
type RestoreFocus = () => boolean;
interface FocusOwner {
  order: number;
  owner: string;
  released: boolean;
  restore: RestoreFocus;
}
export class FocusRestorationStore {
  private owners: FocusOwner[] = [];
  private nextOrder = 0;
  acquire(owner: string, restore: RestoreFocus, order?: number): () => void {
    this.nextOrder += 1;
    const entry = {
      order: order ?? this.nextOrder,
      owner,
      released: false,
      restore,
    };
    const insertion = this.owners.findIndex(
      (current) => current.order > entry.order
    );
    if (insertion === -1) {
      this.owners.push(entry);
    } else {
      this.owners.splice(insertion, 0, entry);
    }
    return () => {
      if (entry.released) {
        return;
      }
      entry.released = true;
      this.restoreReleasedOwners();
    };
  }
  private restoreReleasedOwners() {
    const candidates: RestoreFocus[] = [];
    let tail = this.owners.length - 1;
    while (this.owners[tail]?.released) {
      const entry = this.owners.pop();
      tail -= 1;
      if (entry) {
        candidates.push(entry.restore);
      }
    }
    candidates.some((restore) => restore());
  }
}
export const captureFocusRestore = (
  document = (
    globalThis as {
      document?: FocusDocument;
    }
  ).document
): RestoreFocus => {
  const target = document?.activeElement;
  if (
    !target ||
    target === document?.body ||
    target === document?.documentElement
  ) {
    return () => false;
  }
  return () => {
    if (target.isConnected === false || target.disabled) {
      return false;
    }
    if (target.getAttribute?.("aria-disabled") === "true") {
      return false;
    }
    try {
      target.focus({ preventScroll: true });
    } catch {
      try {
        target.focus();
      } catch {
        return false;
      }
    }
    return document?.activeElement === target;
  };
};
