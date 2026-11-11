import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { CLOSE_SPRING, OPEN_SPRING, SETTLE_SPRING } from "./constants";
import { clamp, fitWithin } from "./geometry";
import type { Rect } from "./geometry";
import { ViewerMotion } from "./motion";
import type { ViewerStore } from "./store";
import type { ImageViewerProps } from "./types";

export interface OverlayProps extends Required<
  Omit<
    ImageViewerProps,
    | "dir"
    | "children"
    | "defaultOpen"
    | "defaultIndex"
    | "onOpenChange"
    | "onIndexChange"
  >
> {
  dir?: "ltr" | "rtl";
  store: ViewerStore;
  onIndexChange: (index: number) => void;
  onRequestClose: () => void;
  onExited: () => void;
  onShow: (id: string | null) => void;
}
export const useViewerOverlayModel = (props: OverlayProps) => {
  const version = useSyncExternalStore(
    props.store.subscribe,
    props.store.getSnapshot,
    props.store.getSnapshot
  );
  const items = props.store.list();
  const count = items.length;
  const page = count ? clamp(props.index, 0, count - 1) : 0;
  const item = items[page];
  const metrics = useWindowMetrics("screen");
  const direction = props.dir === "rtl" ? -1 : 1;
  const W = metrics.width;
  const H = metrics.height;
  const reduced = usePanelReducedMotion();
  const [origin, setOrigin] = useState<Rect | null>(null);
  const [radius, setRadius] = useState(0);
  const motion = useMemo(() => new ViewerMotion(), []);
  const phase = useRef<"opening" | "open" | "closing">("opening");
  const activePage = useRef(page);
  const chromeOn = useRef(true);
  const latest = useRef({ H, W, item, page, props, reduced });
  latest.current = { H, W, item, page, props, reduced };
  const mounted = useRef(true);
  const request = useRef(0);
  const measureCurrent = useCallback((then?: () => void, closing = false) => {
    request.current += 1;
    const revision = request.current;
    const current = latest.current.item;
    if (!current) {
      setOrigin(null);
      then?.();
      return;
    }
    current.measure((rect) => {
      if (
        !mounted.current ||
        revision !== request.current ||
        (closing
          ? phase.current !== "closing"
          : latest.current.item?.id !== current.id)
      ) {
        return;
      }
      const { W: viewportWidth, H: viewportHeight } = latest.current;
      const visible =
        rect !== null &&
        rect.y + rect.height > 0 &&
        rect.y < viewportHeight &&
        rect.x + rect.width > 0 &&
        rect.x < viewportWidth;
      setOrigin(visible ? rect : null);
      setRadius(current.radius);
      then?.();
    });
  }, []);
  const settleOpen = () => {
    phase.current = "opening";
    const done = () => {
      phase.current = "open";
    };
    if (reduced) {
      motion.timing("t", 1, 200, done);
    } else {
      motion.spring("t", 1, OPEN_SPRING, done);
    }
    motion.timing("fade", 1, 150);
    motion.timing("chrome", chromeOn.current ? 1 : 0, 200, undefined, 120);
  };
  const startClose = (vx = 0, vy = 0) => {
    phase.current = "closing";
    measureCurrent(() => {
      if (!mounted.current || phase.current !== "closing") {
        return;
      }
      motion.timing("chrome", 0, 120);
      const done = () => {
        if (phase.current === "closing") {
          latest.current.props.onExited();
        }
      };
      if (reduced) {
        motion.timing("t", 0, 180, done);
        return;
      }
      motion.spring("t", 0, CLOSE_SPRING, done);
      motion.spring("dragX", 0, { ...CLOSE_SPRING, velocity: vx });
      motion.spring("dragY", 0, { ...CLOSE_SPRING, velocity: vy });
      motion.spring("shrink", 1, CLOSE_SPRING);
      motion.spring("scale", 1, CLOSE_SPRING);
      motion.spring("tx", 0, CLOSE_SPRING);
      motion.spring("ty", 0, CLOSE_SPRING);
    }, true);
  };
  const opened = useRef(false);
  useEffect(() => {
    if (!latest.current.item) {
      props.onRequestClose();
      props.onExited();
      return;
    }
    if (props.open) {
      if (opened.current) {
        phase.current = "opening";
        activePage.current = page;
        motion.set({ pagerX: -page * (W + 16), scale: 1, tx: 0, ty: 0 });
        measureCurrent();
        latest.current.props.onShow(latest.current.item?.id ?? null);
        settleOpen();
        return;
      }
      opened.current = true;
      activePage.current = page;
      motion.set({ pagerX: -page * (W + 16) });
      measureCurrent(() => {
        latest.current.props.onShow(latest.current.item?.id ?? null);
        settleOpen();
      });
    } else if (phase.current !== "closing") {
      startClose();
    }
  }, [props.open]);
  const firstPage = useRef(true);
  useEffect(() => {
    if (firstPage.current) {
      firstPage.current = false;
      return;
    }
    if (!item || phase.current === "closing") {
      return;
    }
    if (activePage.current !== page) {
      activePage.current = page;
      motion.set({ scale: 1, tx: 0, ty: 0 });
      if (reduced) {
        motion.set({ pagerX: -page * (W + 16) });
      } else {
        motion.spring("pagerX", -page * (W + 16), SETTLE_SPRING);
      }
    }
    measureCurrent();
    props.onShow(item.id);
  }, [page]);
  const firstSize = useRef(true);
  useEffect(() => {
    if (firstSize.current) {
      firstSize.current = false;
      return;
    }
    if (phase.current === "closing") {
      return;
    }
    motion.set({
      pagerX: -activePage.current * (W + 16),
      scale: 1,
      tx: 0,
      ty: 0,
    });
    measureCurrent();
  }, [W, H, direction]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
      motion.stop();
    };
  }, [motion]);
  const vertical =
    Math.max(metrics.insets.top, metrics.insets.bottom) + props.inset;
  const box = {
    height: Math.max(H - vertical * 2, 1),
    width: Math.max(W - props.inset * 2, 1),
    x: props.inset,
    y: vertical,
  };
  const fit = fitWithin(item?.size ?? box, box);
  return {
    H,
    W,
    activePage,
    direction,
    box,
    chromeOn,
    count,
    fit,
    item,
    items,
    latest,
    metrics,
    motion,
    origin,
    page,
    phase,
    radius,
    reduced,
    startClose,
    version,
  };
};
