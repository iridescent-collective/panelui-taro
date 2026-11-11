import { useCallback, useEffect, useRef, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { FAB_SPRING } from "./constants";
import type { FabGroupProps } from "./types";

export const useFabModel = (
  controlled: boolean | undefined,
  onOpenChange: FabGroupProps["onOpenChange"]
) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlled ?? internalOpen;
  const [present, setPresent] = useState(open);
  const reduced = usePanelReducedMotion();
  const latestOpen = useRef(open);
  latestOpen.current = open;
  const spring = useSourceSpringController(
    open ? 1 : 0,
    FAB_SPRING,
    reduced,
    (value) => {
      if (value === 0 && !latestOpen.current) {
        setPresent(false);
      }
    }
  );
  useEffect(() => {
    if (open) {
      setPresent(true);
    }
    spring.springTo(open ? 1 : 0);
  }, [open, spring.springTo]);
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlled === undefined) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlled, onOpenChange]
  );
  const close = useCallback(() => setOpen(false), [setOpen]);
  useBackHandler(open, close);
  return { close, open, present, setOpen, spring };
};
