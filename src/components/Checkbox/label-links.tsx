import { Children, cloneElement, isValidElement } from "react";
import type { ReactNode } from "react";

import type { TextProps } from "../primitives/Text";

type LabelClick = NonNullable<TextProps["onClick"]>;
interface LabelNodeProps {
  children?: ReactNode;
  onClick?: LabelClick;
  onPress?: LabelClick;
}
const isolatedClick =
  (handler: LabelClick): LabelClick =>
  (event) => {
    event.stopPropagation();
    handler(event);
  };
export const isolateLabelLinks = (label: ReactNode): ReactNode =>
  Children.map(label, (child) => {
    if (!isValidElement<LabelNodeProps>(child)) {
      return child;
    }
    const { children, onClick, onPress } = child.props;
    if (children === undefined && !onClick && !onPress) {
      return child;
    }
    return cloneElement(child, {
      ...(children === undefined
        ? {}
        : { children: isolateLabelLinks(children) }),
      ...(onClick ? { onClick: isolatedClick(onClick) } : {}),
      ...(onPress ? { onPress: isolatedClick(onPress) } : {}),
    });
  });
