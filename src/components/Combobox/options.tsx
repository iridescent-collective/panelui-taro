import { Children, cloneElement, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { ComboboxGroup, ComboboxItem } from "./parts";
import type { ComboboxGroupProps, ComboboxItemProps } from "./types";

export const collectComboboxOptions = (
  children: ReactNode
): ComboboxItemProps[] => {
  const options: ComboboxItemProps[] = [];
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }
    if (child.type === ComboboxGroup) {
      options.push(
        ...collectComboboxOptions((child.props as ComboboxGroupProps).children)
      );
    } else if (child.type === ComboboxItem) {
      options.push(child.props as ComboboxItemProps);
    }
  }
  return options;
};
export const filterComboboxOptions = (
  children: ReactNode,
  matches: (option: ComboboxItemProps) => boolean
): ReactNode[] => {
  const kept: ReactNode[] = [];
  for (const [index, child] of Children.toArray(children).entries()) {
    if (!isValidElement(child)) {
      continue;
    }
    if (child.type === ComboboxGroup) {
      const props = child.props as ComboboxGroupProps;
      const inner = filterComboboxOptions(props.children, matches);
      if (inner.length) {
        kept.push(
          cloneElement(
            child as ReactElement<ComboboxGroupProps>,
            { key: child.key ?? `group:${props.label ?? index}` },
            inner
          )
        );
      }
    } else if (
      child.type === ComboboxItem &&
      matches(child.props as ComboboxItemProps)
    ) {
      const props = child.props as ComboboxItemProps;
      kept.push(
        cloneElement(child as ReactElement<ComboboxItemProps>, {
          key: child.key ?? `option:${props.value}`,
        })
      );
    }
  }
  return kept;
};
