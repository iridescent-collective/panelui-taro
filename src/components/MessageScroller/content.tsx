import { View } from "@tarojs/components";
import { useEffect } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import type { MessageScrollerContentProps } from "./types";

export const MessageScrollerContent = ({
  className,
  children,
  onLayout,
  ...props
}: MessageScrollerContentProps) => {
  const measure = useElementLayout(
    Boolean(onLayout),
    children,
    props.id,
    false
  );
  useEffect(() => {
    if (measure.layout) {
      onLayout?.({
        nativeEvent: {
          layout: {
            height: measure.layout.height,
            width: measure.layout.width,
            x: measure.layout.left,
            y: measure.layout.top,
          },
        },
      });
    }
  }, [measure.layout, onLayout]);
  return (
    <View
      {...props}
      id={props.id ?? measure.id}
      aria-live="polite"
      className={cn("flex flex-col gap-[24px] p-[32px] pb-[128px]", className)}
    >
      {textChildren(children)}
    </View>
  );
};
MessageScrollerContent.displayName = "MessageScroller.Content";
