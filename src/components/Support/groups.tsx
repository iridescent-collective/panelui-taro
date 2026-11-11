import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text, textChildren } from "../primitives/Text";
import type { SupportGroupProps } from "./types";
import { supportVariants } from "./variants";

const group = (name: string) => {
  const Group = forwardRef<ComponentRef<typeof View>, SupportGroupProps>(
    ({ className, title, children, ...props }, ref) => {
      const { group: groupClass, groupTitle } = supportVariants();
      return (
        <View ref={ref} className={groupClass({ className })} {...props}>
          {title ? <Text className={groupTitle()}>{title}</Text> : null}
          {textChildren(children)}
        </View>
      );
    }
  );
  Group.displayName = name;
  return Group;
};
export const SupportChannels = group("Support.Channels");
export const SupportConversations = group("Support.Conversations");
export const SupportArticles = group("Support.Articles");
