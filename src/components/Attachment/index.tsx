import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Item } from "../Item";
import { AttachmentContext, isAttachmentBusy } from "./context";
import {
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "./parts";
import type { AttachmentProps } from "./types";
import { rootVariants } from "./variants";

export type {
  AttachmentProps,
  AttachmentState,
  AttachmentSize,
  AttachmentGroupProps,
  AttachmentMediaProps,
  AttachmentContentProps,
  AttachmentTitleProps,
  AttachmentDescriptionProps,
  AttachmentActionsProps,
  AttachmentActionProps,
} from "./types";
const AttachmentRoot = forwardRef<ComponentRef<typeof View>, AttachmentProps>(
  (
    {
      className,
      state = "done",
      size = "default",
      orientation,
      progress,
      children,
      ...props
    },
    ref
  ) => {
    const track = useThemeToken("primary");
    const safeProgress =
      progress !== undefined && Number.isFinite(progress)
        ? Math.min(100, Math.max(0, progress * 100))
        : 0;
    const context = useMemo(() => ({ size, state }), [state, size]);
    return (
      <AttachmentContext.Provider value={context}>
        <Item
          {...props}
          ref={ref}
          size={size}
          orientation={orientation}
          variant="outline"
          className={cn("overflow-hidden", rootVariants({ state }), className)}
        >
          {children}
          {isAttachmentBusy(state) && progress !== undefined ? (
            <View className="absolute right-0 bottom-0 left-0 h-[4px] bg-[var(--panel-muted)]">
              <View
                style={{
                  backgroundColor: track,
                  width: `${safeProgress}%`,
                }}
                className="h-full"
              />
            </View>
          ) : null}
        </Item>
      </AttachmentContext.Provider>
    );
  }
);
export const Attachment = Object.assign(AttachmentRoot, {
  Action: AttachmentAction,
  Actions: AttachmentActions,
  Content: AttachmentContent,
  Description: AttachmentDescription,
  Group: AttachmentGroup,
  Media: AttachmentMedia,
  Title: AttachmentTitle,
});
