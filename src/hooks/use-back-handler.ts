import { useContext, useEffect, useId, useRef, useState } from "react";

import {
  BackHandlerContext,
  OverlayOrderContext,
  reserveOverlayOrder,
} from "../primitives/back-handler-context";

export const useBackHandler = (enabled: boolean, onBack: () => void): void => {
  const store = useContext(BackHandlerContext);
  const layer = useContext(OverlayOrderContext);
  const [fallbackOrder] = useState(reserveOverlayOrder);
  const owner = useId();
  const latest = useRef(onBack);
  latest.current = onBack;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (!store) {
      throw new Error("useBackHandler must be used within a <PanelUIProvider>");
    }
    return store.acquire(owner, layer ?? fallbackOrder, () => latest.current());
  }, [enabled, fallbackOrder, layer, owner, store]);
};
