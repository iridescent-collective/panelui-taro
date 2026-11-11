import type { ReactNode } from "react";

export type ToastVariant =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "destructive";
export type ToastPlacement = "top" | "bottom";
export interface ToastHandle {
  id: string;
  hide: () => void;
}
export interface ToastOptions {
  variant?: ToastVariant;
  placement?: ToastPlacement;
  label?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onActionPress?: (handle: ToastHandle) => void;
  closable?: boolean;
  swipeToDismiss?: boolean;
  duration?: number;
  component?: (handle: ToastHandle) => ReactNode;
}
export interface ToastItem extends ToastOptions {
  id: string;
}
const DEFAULT_DURATION = 4000;
let counter = 0;
interface ToastTimer {
  remaining: number;
  startedAt?: number;
  timeout?: ReturnType<typeof setTimeout>;
}
export class ToastStore {
  private items: ToastItem[] = [];
  private snapshot: readonly ToastItem[] = this.items;
  private listeners = new Set<() => void>();
  private timers = new Map<string, ToastTimer>();
  private timersPaused = false;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = (): readonly ToastItem[] => this.snapshot;
  show = (options: ToastOptions | string): string => {
    const resolved: ToastOptions =
      typeof options === "string" ? { label: options } : options;
    counter += 1;
    const id = `toast-${counter}`;
    this.items = [...this.items, { ...resolved, id }];
    const duration = resolved.duration ?? DEFAULT_DURATION;
    if (duration > 0) {
      const timer = { remaining: duration };
      this.timers.set(id, timer);
      if (!this.timersPaused) {
        this.startTimer(id, timer);
      }
    }
    this.emit();
    return id;
  };
  hide = (id: string) => {
    const timer = this.timers.get(id);
    if (timer) {
      if (timer.timeout !== undefined) {
        clearTimeout(timer.timeout);
      }
      this.timers.delete(id);
    }
    if (!this.items.some((item) => item.id === id)) {
      return;
    }
    this.items = this.items.filter((item) => item.id !== id);
    this.emit();
  };
  hideAll = () => {
    for (const timer of this.timers.values()) {
      if (timer.timeout !== undefined) {
        clearTimeout(timer.timeout);
      }
    }
    this.timers.clear();
    if (this.items.length === 0) {
      return;
    }
    this.items = [];
    this.emit();
  };
  pauseTimers = () => {
    if (this.timersPaused) {
      return;
    }
    this.timersPaused = true;
    const now = Date.now();
    for (const timer of this.timers.values()) {
      if (timer.timeout === undefined || timer.startedAt === undefined) {
        continue;
      }
      clearTimeout(timer.timeout);
      timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt));
      delete timer.timeout;
      delete timer.startedAt;
    }
  };
  resumeTimers = () => {
    if (!this.timersPaused) {
      return;
    }
    this.timersPaused = false;
    for (const [id, timer] of this.timers) {
      this.startTimer(id, timer);
    }
  };
  private startTimer(id: string, timer: ToastTimer) {
    timer.startedAt = Date.now();
    timer.timeout = setTimeout(() => this.hide(id), timer.remaining);
  }
  private emit() {
    this.snapshot = this.items;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
export const toastStore = new ToastStore();
export const toast = {
  hide: toastStore.hide,
  hideAll: toastStore.hideAll,
  show: toastStore.show,
};
