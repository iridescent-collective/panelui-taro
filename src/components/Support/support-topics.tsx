import { View } from "@tarojs/components";
import { forwardRef, useMemo, useState } from "react";
import type { ComponentRef } from "react";

import { Text, textChildren } from "../primitives/Text";
import { TopicsContext } from "./context";
import type { TopicsContextValue, SupportTopicsProps } from "./types";
import { supportVariants } from "./variants";

export const SupportTopics = forwardRef<
  ComponentRef<typeof View>,
  SupportTopicsProps
>(
  (
    {
      className,
      title,
      value: valueProp,
      defaultValue = null,
      onValueChange,
      children,
      ...props
    },
    ref
  ) => {
    const { group: groupClass, groupTitle } = supportVariants();
    const [internal, setInternal] = useState<string | null>(defaultValue);
    const controlled = valueProp !== undefined;
    const value = controlled ? valueProp : internal;
    const context = useMemo<TopicsContextValue>(
      () => ({
        select: (next: string) => {
          if (!controlled) {
            setInternal(next);
          }
          onValueChange?.(next);
        },
        value: value ?? null,
      }),
      [value, controlled, onValueChange]
    );
    return (
      <TopicsContext.Provider value={context}>
        <View
          ref={ref}
          role="radiogroup"
          aria-role="radiogroup"
          className={groupClass({ className })}
          {...props}
        >
          {title ? <Text className={groupTitle()}>{title}</Text> : null}
          {textChildren(children)}
        </View>
      </TopicsContext.Provider>
    );
  }
);
SupportTopics.displayName = "Support.Topics";
