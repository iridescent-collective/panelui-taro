import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import type { SupportNoteProps } from "./types";
import { supportVariants } from "./variants";

export const SupportNote = forwardRef<
  ComponentRef<typeof View>,
  SupportNoteProps
>(({ className, children, ...props }, ref) => {
  const { note } = supportVariants();
  return (
    <View ref={ref} className="w-full" {...props}>
      <Text size="xs" muted className={note({ className })}>
        {children}
      </Text>
    </View>
  );
});
SupportNote.displayName = "Support.Note";
