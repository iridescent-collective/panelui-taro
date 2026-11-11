import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { textChildren } from "../primitives/Text";
import type { SupportRepliesProps } from "./types";
import { supportVariants } from "./variants";

export const SupportReplies = forwardRef<
  ComponentRef<typeof View>,
  SupportRepliesProps
>(({ className, children, ...props }, ref) => {
  const { replies } = supportVariants();
  return (
    <View ref={ref} className={replies({ className })} {...props}>
      {textChildren(children)}
    </View>
  );
});
SupportReplies.displayName = "Support.Replies";
