import { useCallback, useMemo, useRef, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useControllableState } from "../../primitives/controllable-state";
import { ModalPortal } from "../../primitives/portal";
import { ViewerContext } from "./context";
import { ViewerOverlay } from "./overlay";
import { ViewerStore } from "./store";
import { ImageViewerTrigger } from "./trigger";
import type { ImageViewerProps } from "./types";

export type {
  ImageViewerProps,
  ImageViewerDirection,
  ImageViewerTriggerProps,
  ImageViewerSource,
} from "./types";
const ImageViewerRoot = ({
  children,
  dir = "ltr",
  open,
  defaultOpen = false,
  onOpenChange,
  index,
  defaultIndex = 0,
  onIndexChange,
  blur = true,
  maxScale = 4,
  doubleTapScale = 2.5,
  haptics = true,
  showClose = true,
  closeLabel = "Close",
  inset = 16,
  cornerRadius = 16,
}: ImageViewerProps) => {
  const store = useRef<ViewerStore | null>(null);
  store.current ??= new ViewerStore();
  const registry = store.current;
  const { value: isOpen, setValue: setOpen } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const { value: page, setValue: setPage } = useControllableState({
    defaultValue: defaultIndex,
    onChange: onIndexChange,
    value: index,
  });
  const [mounted, setMounted] = useState(isOpen);
  if (isOpen && !mounted) {
    setMounted(true);
  }
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const openItem = useCallback(
    (id: string) => {
      const at = registry.list().findIndex((item) => item.id === id);
      if (at === -1) {
        return;
      }
      setPage(at);
      setOpen(true);
    },
    [registry, setPage, setOpen]
  );
  const close = useCallback(() => setOpen(false), [setOpen]);
  const exited = useCallback(() => {
    setMounted(false);
    setHiddenId(null);
  }, []);
  useBackHandler(isOpen, close);
  const context = useMemo(
    () => ({ hiddenId, openItem, store: registry }),
    [registry, hiddenId, openItem]
  );
  return (
    <ViewerContext.Provider value={context}>
      {children}
      {mounted ? (
        <ModalPortal interactive={isOpen}>
          <ViewerOverlay
            dir={dir}
            store={registry}
            open={isOpen}
            index={page}
            onIndexChange={setPage}
            onRequestClose={close}
            onExited={exited}
            onShow={setHiddenId}
            blur={blur}
            maxScale={maxScale}
            doubleTapScale={doubleTapScale}
            haptics={haptics}
            showClose={showClose}
            closeLabel={closeLabel}
            inset={inset}
            cornerRadius={cornerRadius}
          />
        </ModalPortal>
      ) : null}
    </ViewerContext.Provider>
  );
};
export const ImageViewer = Object.assign(ImageViewerRoot, {
  Trigger: ImageViewerTrigger,
});
