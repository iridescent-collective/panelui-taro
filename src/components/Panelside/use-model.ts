import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { selectionTick } from "../../lib/haptics";
import { createObservableNumber } from "../../primitives/observable-number";
import { SPRING, EDGE_WIDTH, GAP } from "./constants";
import {
  panelsideWidth,
  panelsideBackEnabled,
  panelsideSpringVelocity,
} from "./math";
import type { PanelsideProps } from "./types";
import { usePanelsidePan } from "./use-pan";

export const usePanelsideModel = ({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  mode = "push",
  width: widthProp,
  dock = false,
  swipeEnabled = true,
  swipeFrom = "anywhere",
  edgeWidth = EDGE_WIDTH,
  dismissible = true,
  haptics = false,
  scale,
  radius,
  dim,
  route: controlledRoute,
  defaultRoute = "",
  onRouteChange,
}: PanelsideProps) => {
  const sign = useDirectionSign();
  const reduced = usePanelReducedMotion();
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const [localRoute, setLocalRoute] = useState(defaultRoute);
  const route = controlledRoute ?? localRoute;
  const measure = useElementLayout(true, dock);
  const containerWidth = measure.layout?.width ?? 375;
  const docked = dock !== false && containerWidth >= dock;
  const width = panelsideWidth(containerWidth, widthProp, docked);
  const extent = Math.max(1, mode === "push" ? width + GAP : width);
  const [progress] = useState(() => createObservableNumber(open ? 1 : 0));
  const currentExtent = useRef(extent);
  currentExtent.current = extent;
  const publish = useCallback(
    (value: number) => {
      progress.value = value / currentExtent.current;
    },
    [progress]
  );
  const motion = useSourceSpringController(
    open ? extent : 0,
    SPRING,
    reduced,
    publish
  );
  const target = useRef<number | null>(null);
  const settle = useCallback(
    (next: boolean, velocity?: number) => {
      const destination = next ? extent : 0;
      if (motion.read() === destination) {
        return;
      }
      if (target.current === destination) {
        return;
      }
      target.current = destination;
      const position = motion.read();
      motion.springTo(
        destination,
        panelsideSpringVelocity(position, destination, velocity)
      );
    },
    [extent, motion.read, motion.springTo]
  );
  useEffect(
    () =>
      motion.signal.subscribe(() => {
        if (motion.signal.value === target.current) {
          target.current = null;
        }
      }),
    [motion.signal]
  );
  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setLocalOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange]
  );
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const navigate = useCallback(
    (next: string) => {
      if (controlledRoute === undefined) {
        setLocalRoute(next);
      }
      onRouteChange?.(next);
    },
    [controlledRoute, onRouteChange]
  );
  useBackHandler(panelsideBackEnabled(open, dismissible, docked), close);
  useEffect(() => {
    progress.value = motion.read() / extent;
    if (docked) {
      target.current = null;
      motion.setImmediate(extent);
    } else {
      settle(open);
    }
  }, [docked, extent, open, settle, motion.setImmediate]);
  const latest = useRef({ open, settle });
  latest.current = { open, settle };
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  const pan = usePanelsidePan({
    edge: edgeWidth,
    enabled: swipeEnabled && !docked,
    extent,
    finish: (next, velocity) => {
      settle(next, velocity);
      if (next !== open && haptics) {
        void selectionTick();
      }
      setOpen(next);
      request.current += 1;
      const version = request.current;
      queueMicrotask(() => {
        if (
          mounted.current &&
          version === request.current &&
          latest.current.open !== next
        ) {
          latest.current.settle(latest.current.open);
        }
      });
    },
    from: swipeFrom,
    left: measure.layout?.left ?? 0,
    open,
    restore: () => settle(open),
    sign,
    translation: motion.read,
    update: (value) => {
      target.current = null;
      motion.setImmediate(value);
    },
    width: containerWidth,
  });
  const context = useMemo(
    () => ({
      dim,
      dismissible,
      docked,
      mode,
      navigate,
      open,
      progress,
      radius,
      route,
      scale,
      setOpen,
      toggle,
      width,
    }),
    [
      open,
      setOpen,
      toggle,
      progress,
      width,
      mode,
      docked,
      dismissible,
      scale,
      radius,
      dim,
      route,
      navigate,
    ]
  );
  return { context, id: measure.id, pan };
};
