import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode, ReactElement } from "react";

import { SelectItem, SelectGroup } from "./parts";
import type { SelectItemProps, SelectGroupProps } from "./types";

export const collectOptions = (
  children: ReactNode
): { options: SelectItemProps[]; fullyDeclared: boolean } => {
  const options: SelectItemProps[] = [];
  let fullyDeclared = true;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      fullyDeclared = false;
      continue;
    }
    if (child.type === SelectGroup) {
      const inner = collectOptions((child.props as SelectGroupProps).children);
      options.push(...inner.options);
      fullyDeclared &&= inner.fullyDeclared;
    } else if (child.type === SelectItem) {
      options.push(child.props as SelectItemProps);
    } else {
      fullyDeclared = false;
    }
  }
  return { fullyDeclared, options };
};
export const filterOptions = (
  children: ReactNode,
  needle: string
): { kept: ReactNode[]; seen: number } => {
  const kept: ReactNode[] = [];
  let seen = 0;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      kept.push(child);
      continue;
    }
    if (child.type === SelectGroup) {
      const inner = filterOptions(
        (child.props as SelectGroupProps).children,
        needle
      );
      seen += inner.seen;
      if (inner.kept.length) {
        kept.push(
          cloneElement(child as ReactElement<SelectGroupProps>, {}, inner.kept)
        );
      }
    } else if (child.type === SelectItem) {
      seen += 1;
      if (
        (child.props as SelectItemProps).label.toLowerCase().includes(needle)
      ) {
        kept.push(child);
      }
    } else {
      kept.push(child);
    }
  }
  return { kept, seen };
};
