import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useMemo,
} from "react";
import type { ComponentRef, ReactElement, ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Frame } from "../Frame";
import { textChildren } from "../primitives/Text";
import { TableContext } from "./context";
import { TableHeader } from "./rows";
import type { TableFrameProps, TableHeaderProps } from "./types";

export const TableFrame = forwardRef<
  ComponentRef<typeof View>,
  TableFrameProps
>(
  (
    {
      className,
      title,
      action,
      description,
      size = "default",
      striped = false,
      columns,
      children,
      ...props
    },
    ref
  ) => {
    const context = useMemo(
      () => ({ columns, size, striped }),
      [size, striped, columns]
    );
    const { heading, body } = useMemo(() => {
      let found: ReactElement<TableHeaderProps> | null = null;
      const remaining: ReactNode[] = [];
      for (const child of Children.toArray(children)) {
        if (
          !found &&
          isValidElement<TableHeaderProps>(child) &&
          child.type === TableHeader
        ) {
          found = cloneElement(child, {
            className: cn("border-b-[0px]", child.props.className),
          });
        } else {
          remaining.push(child);
        }
      }
      return { body: remaining, heading: found };
    }, [children]);
    const captioned =
      title !== undefined || description !== undefined || Boolean(action);
    return (
      <TableContext.Provider value={context}>
        <Frame
          {...props}
          ref={ref}
          role="table"
          aria-role="table"
          className={className}
        >
          {captioned ? (
            <Frame.Header className={cn("items-start", heading && "pb-[12px]")}>
              <View className="flex min-w-0 flex-1 flex-col gap-[4px]">
                {textChildren(title, (text) => (
                  <Frame.Title>{text}</Frame.Title>
                ))}
                {textChildren(description, (text) => (
                  <Frame.Description>{text}</Frame.Description>
                ))}
              </View>
              {action ? <Frame.Action>{action}</Frame.Action> : null}
            </Frame.Header>
          ) : null}
          {heading ? (
            <View className={cn("pb-[16px]", captioned ? "pt-0" : "pt-[20px]")}>
              {heading}
            </View>
          ) : null}
          <Frame.Panel dividers={false}>{body}</Frame.Panel>
        </Frame>
      </TableContext.Provider>
    );
  }
);
