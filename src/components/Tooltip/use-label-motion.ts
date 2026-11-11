import { nextTick } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import type { TooltipPlacement } from "./types";

const ENTRY_SHIFT = {
  bottom: { x: 0, y: -6 },
  left: { x: 6, y: 0 },
  right: { x: -6, y: 0 },
  top: { x: 0, y: 6 },
};
export const useLabelMotion = (
  open: boolean,
  placed: boolean,
  placement: TooltipPlacement
) => {
  const [shown, setShown] = useState(false);
  const reduced = usePanelReducedMotion();
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!placed) {
      setShown(false);
      return;
    }
    let active = true;
    nextTick(() => {
      if (active) {
        setShown(true);
      }
    });
    return () => {
      active = false;
    };
  }, [open, placed]);
  const origin = ENTRY_SHIFT[placement];
  return {
    opacity: Number(open && placed && (shown || reduced)),
    transform: reduced
      ? "none"
      : `translate(${shown ? 0 : origin.x * 2}rpx,${shown ? 0 : origin.y * 2}rpx) scale(${shown ? 1 : 0.9})`,
    transition: reduced
      ? "none"
      : "opacity 100ms ease, transform 400ms cubic-bezier(0.22,1,0.36,1)",
  };
};
