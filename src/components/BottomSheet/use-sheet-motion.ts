import { nextTick } from "@tarojs/taro";
import { useEffect, useState } from "react";

export const SHEET_ENTER_DURATION = 420;
export const SHEET_EXIT_DURATION = 380;
export const SHEET_FADE_DURATION = 150;
export const useSheetMotion = (
  open: boolean,
  height: number,
  reduced: boolean
) => {
  const [translation, setTranslation] = useState(() => (reduced ? 0 : height));
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    let current = true;
    setDragging(false);
    nextTick(() => {
      if (current) {
        setTranslation(open ? 0 : height);
        setVisible(open);
      }
    });
    return () => {
      current = false;
    };
  }, [open, height]);
  return {
    dragging,
    setDragging,
    setTranslation,
    transition:
      dragging || reduced
        ? "none"
        : `transform ${open ? SHEET_ENTER_DURATION : SHEET_EXIT_DURATION}ms cubic-bezier(0.32,0.72,0,1)`,
    translation,
    visible,
  };
};
