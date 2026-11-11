import { View } from "@tarojs/components";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { textChildren, Text } from "../primitives/Text";

export const ExpandingLabel = ({
  active,
  still,
  className,
  children,
}: {
  active: boolean;
  still: boolean;
  className: string;
  children: ReactNode;
}) => {
  const measure = useElementLayout(true, children);
  const width = Math.ceil(measure.layout?.width ?? 0) + 2;
  const label = textChildren(children, (text) => (
    <Text size="sm" weight="medium" numberOfLines={1} className={className}>
      {text}
    </Text>
  ));
  return (
    <>
      <View
        className="overflow-hidden"
        style={{
          opacity: Number(active),
          transition: still
            ? "none"
            : "width 260ms cubic-bezier(0.2,0,0,1), opacity 143ms ease 91ms",
          width: `${active ? (width + 6) * 2 : 0}rpx`,
        }}
      >
        <View
          style={{
            paddingInlineStart: "12rpx",
            width: `${(width + 6) * 2}rpx`,
          }}
        >
          {label}
        </View>
      </View>
      <View
        aria-hidden
        className="absolute opacity-0"
        style={{ pointerEvents: "none", width: "800rpx" }}
      >
        <View id={measure.id} className={cn("flex w-max self-start")}>
          {label}
        </View>
      </View>
    </>
  );
};
