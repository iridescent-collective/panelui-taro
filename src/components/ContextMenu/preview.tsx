import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { Portal } from "../../primitives/portal";
import { usePopoverAnchor } from "../Popover";
import { textChildren } from "../primitives/Text";
import { CONTEXT_PREVIEW_SCALE, CONTEXT_PREVIEW_SPRING } from "./constants";
import { useContextMenu } from "./context";
import type { ContextMenuPreviewProps } from "./types";

export const ContextMenuPreview = ({
  children,
  className,
}: ContextMenuPreviewProps) => {
  const { target, content } = useContextMenu("ContextMenu.Preview");
  const { open } = usePopoverAnchor("ContextMenu.Preview");
  const reduced = usePanelReducedMotion();
  const lift = useSourceSpring(
    open ? 1 : 0,
    CONTEXT_PREVIEW_SPRING,
    reduced,
    0
  );
  if (!target) {
    return null;
  }
  return (
    <Portal>
      <View
        aria-hidden
        className={className}
        style={{
          left: `${target.x * 2}rpx`,
          opacity: open ? lift : 0,
          pointerEvents: "none",
          position: "fixed",
          top: `${target.y * 2}rpx`,
          transform: `scale(${1 + lift * (CONTEXT_PREVIEW_SCALE - 1)})`,
          transition: reduced || open ? "none" : "opacity 140ms linear",
          width: `${target.width * 2}rpx`,
        }}
      >
        {textChildren(children ?? content)}
      </View>
    </Portal>
  );
};
ContextMenuPreview.displayName = "ContextMenu.Preview";
