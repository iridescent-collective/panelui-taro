import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { SwipeAction, SwipeStart, SwipeEnd } from "./action";
import type {
  DeclaredAction,
  SwipeActionProps,
  SwipePanelProps,
} from "./types";

export const swipeChildren = (children: ReactNode) => {
  let startNode: ReactNode = null;
  let endNode: ReactNode = null;
  const row: ReactNode[] = [];
  for (const child of Children.toArray(children)) {
    if (isValidElement<SwipePanelProps>(child) && child.type === SwipeStart) {
      startNode = child.props.children;
    } else if (
      isValidElement<SwipePanelProps>(child) &&
      child.type === SwipeEnd
    ) {
      endNode = child.props.children;
    } else {
      row.push(child);
    }
  }
  return { endNode, row, startNode };
};
export const collectSwipeActions = (children: ReactNode): DeclaredAction[] =>
  Children.toArray(children).flatMap((child) =>
    isValidElement<SwipeActionProps>(child) && child.type === SwipeAction
      ? [
          {
            color: child.props.color ?? "default",
            label: child.props.label,
            onPress: child.props.onPress,
          },
        ]
      : []
  );
