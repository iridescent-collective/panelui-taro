import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { SearchBarToken } from "./parts";

export const captureSearchTokens = (tokens: ReactNode) =>
  Children.toArray(tokens);
export const sameSearchTokens = (
  previous: ReturnType<typeof captureSearchTokens>,
  tokens: ReactNode
) => {
  const current = captureSearchTokens(tokens);
  if (previous.length !== current.length) {
    return false;
  }
  return previous.every((before, index) => {
    const after = current[index];
    if (before === after) {
      return true;
    }
    if (
      !isValidElement<{ children?: ReactNode; leading?: ReactNode }>(before) ||
      !isValidElement<{ children?: ReactNode; leading?: ReactNode }>(after)
    ) {
      return false;
    }
    return (
      before.type === SearchBarToken &&
      after.type === SearchBarToken &&
      before.key === after.key &&
      before.props.children === after.props.children &&
      before.props.leading === after.props.leading
    );
  });
};
