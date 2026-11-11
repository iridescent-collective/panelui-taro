import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { FlipCardFront, FlipCardBack } from "./faces";

export const resolveFaces = (children: ReactNode) => {
  let front: ReactNode = null;
  let back: ReactNode = null;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }
    if (child.type === FlipCardFront) {
      front = child;
    } else if (child.type === FlipCardBack) {
      back = child;
    }
  }
  return { back, front };
};
