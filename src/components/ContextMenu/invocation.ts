export type ContextMenuInvocation = "menu" | "press";
export interface ContextMenuKey {
  key: string;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  repeat?: boolean;
}
export interface ContextMenuKeyDownEvent {
  nativeEvent: ContextMenuKey;
  preventDefault: () => void;
  isDefaultPrevented: () => boolean;
}
export const contextMenuAccessibilityInvocation = (
  actionName: string,
  hasPrimaryAction: boolean,
  disabled: boolean
): ContextMenuInvocation | undefined => {
  if (disabled) {
    return undefined;
  }
  if (actionName === "showMenu") {
    return "menu";
  }
  if (actionName === "activate") {
    return hasPrimaryAction ? "press" : "menu";
  }
  return undefined;
};
export const contextMenuKeyInvocation = (
  event: ContextMenuKey,
  hasPrimaryAction: boolean,
  disabled: boolean
): ContextMenuInvocation | undefined => {
  if (disabled || event.repeat) {
    return undefined;
  }
  if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) {
    return "menu";
  }
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  if (event.key === "Enter" || event.key === " ") {
    return hasPrimaryAction ? "press" : "menu";
  }
  return undefined;
};
