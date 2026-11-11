import { Children, isValidElement, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { Menu } from "../Menu";
import { ContextMenuContext } from "./context";
import {
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
} from "./parts";
import { ContextMenuPreview } from "./preview";
import { ContextMenuTrigger } from "./trigger";
import type { ContextMenuProps, ContextMenuTargetRect } from "./types";

export type {
  ContextMenuProps,
  ContextMenuAnchor,
  ContextMenuTriggerProps,
  ContextMenuTriggerHandle,
  ContextMenuPreviewProps,
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuAccessibilityAction,
  ContextMenuAccessibilityEvent,
} from "./types";
export type {
  ContextMenuKey,
  ContextMenuKeyDownEvent,
  ContextMenuInvocation,
} from "./invocation";
export const declaresContextPreview = (children: ReactNode): boolean =>
  Children.toArray(children).some((child) => {
    if (!isValidElement<{ children?: ReactNode }>(child)) {
      return false;
    }
    return (
      child.type === ContextMenuPreview ||
      declaresContextPreview(child.props.children)
    );
  });
const ContextMenuRoot = ({ children, ...props }: ContextMenuProps) => {
  const [target, setTarget] = useState<ContextMenuTargetRect | null>(null);
  const [content, setContent] = useState<ReactNode>(null);
  const hasPreview = declaresContextPreview(children);
  const context = useMemo(
    () => ({ content, hasPreview, setContent, setTarget, target }),
    [target, content, hasPreview]
  );
  return (
    <ContextMenuContext.Provider value={context}>
      <Menu {...props}>{children}</Menu>
    </ContextMenuContext.Provider>
  );
};
ContextMenuRoot.displayName = "ContextMenu";
export const ContextMenu = Object.assign(ContextMenuRoot, {
  Background: Menu.Background,
  CheckboxItem: ContextMenuCheckboxItem,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Label: Menu.Label,
  Preview: ContextMenuPreview,
  RadioGroup: Menu.RadioGroup,
  RadioItem: Menu.RadioItem,
  Separator: Menu.Separator,
  Sub: Menu.Sub,
  SubContent: Menu.SubContent,
  SubTrigger: Menu.SubTrigger,
  Trigger: ContextMenuTrigger,
});
