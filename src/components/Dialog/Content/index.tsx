import { View } from "@tarojs/components";

import { useBackHandler } from "../../../hooks/use-back-handler";
import { usePresence } from "../../../hooks/use-presence";
import { usePanelReducedMotion } from "../../../hooks/use-reduced-motion";
import { cn } from "../../../lib/utils";
import { ModalPortal } from "../../../primitives/portal";
import { Scrim } from "../../../primitives/scrim";
import { textChildren } from "../../primitives/Text";
import { DialogContext, useDialog } from "../context";
import type { DialogContentProps } from "../types";

const EXIT_DURATION = 150;
const DialogLayer = ({
  dismissible = true,
  unstyled = false,
  exitDuration: _exitDuration,
  overlayClassName,
  blur = false,
  className,
  children,
  ...props
}: DialogContentProps) => {
  const { open, setOpen } = useDialog("Dialog.Content");
  const reduced = usePanelReducedMotion();
  useBackHandler(open && dismissible, () => setOpen(false));
  return (
    <View
      className={cn(
        "fixed inset-0 z-[1000] flex items-center justify-center p-[48px]",
        !unstyled &&
          !reduced &&
          (open ? "panelui-dialog-layer--enter" : "panelui-dialog-layer--exit")
      )}
      catchMove
    >
      <Scrim
        blur={blur}
        data-state={open ? "open" : "closed"}
        className={overlayClassName}
      />
      <View
        className="absolute inset-0"
        role="button"
        aria-role="button"
        aria-label="Close dialog"
        aria-disabled={!dismissible || !open}
        onClick={(event) => {
          event.stopPropagation();
          if (dismissible && open) {
            setOpen(false);
          }
        }}
      />
      <View
        {...props}
        data-state={open ? "open" : "closed"}
        role="dialog"
        aria-role="dialog"
        aria-modal
        aria-hidden={!open}
        className={cn(
          !unstyled &&
            "relative flex w-full max-w-[768px] flex-col gap-[12px] rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] p-[40px] shadow-lg",
          !unstyled &&
            !reduced &&
            (open
              ? "panelui-dialog-panel--enter"
              : "panelui-dialog-panel--exit"),
          className
        )}
      >
        {textChildren(children)}
      </View>
    </View>
  );
};
export const DialogContent = (props: DialogContentProps) => {
  const context = useDialog("Dialog.Content");
  const reduced = usePanelReducedMotion();
  const present = usePresence(
    context.open,
    reduced ? 0 : (props.exitDuration ?? EXIT_DURATION)
  );
  if (!present) {
    return null;
  }
  return (
    <ModalPortal interactive={context.open}>
      <DialogContext.Provider value={context}>
        <DialogLayer {...props} />
      </DialogContext.Provider>
    </ModalPortal>
  );
};
