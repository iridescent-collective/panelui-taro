import { useCallback, useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import type { SectionRailProps } from "./types";

export const useSectionRailState = (props: SectionRailProps) => {
  const [internalValue, setInternalValue] = useState(props.defaultValue);
  const [internalOpen, setInternalOpen] = useState(props.defaultOpen ?? false);
  const value = props.value ?? internalValue;
  const open = props.open ?? internalOpen;
  const latest = useRef(props);
  latest.current = props;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jump = useRef<{ target: string; landed: boolean } | null>(null);
  const setOpen = useCallback((next: boolean) => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (latest.current.open === undefined) {
      setInternalOpen(next);
    }
    latest.current.onOpenChange?.(next);
  }, []);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const endJump = useCallback(() => {
    jump.current = null;
    if (jumpTimer.current !== null) {
      clearTimeout(jumpTimer.current);
      jumpTimer.current = null;
    }
  }, []);
  const onValueChange = useCallback(
    (next: string) => {
      jump.current = { landed: false, target: next };
      if (jumpTimer.current !== null) {
        clearTimeout(jumpTimer.current);
      }
      jumpTimer.current = setTimeout(endJump, 900);
      if (latest.current.value === undefined) {
        setInternalValue(next);
      }
      latest.current.onValueChange?.(next);
      const delay = latest.current.closeDelay ?? 300;
      if (delay <= 0) {
        setOpen(false);
        return;
      }
      if (closeTimer.current !== null) {
        clearTimeout(closeTimer.current);
      }
      closeTimer.current = setTimeout(() => setOpen(false), delay);
    },
    [endJump, setOpen]
  );
  const ticked = useRef(false);
  useEffect(() => {
    if (!ticked.current) {
      ticked.current = true;
      return;
    }
    const request = jump.current;
    if (request) {
      if (value !== request.target || request.landed) {
        return;
      }
      request.landed = true;
      if (jumpTimer.current !== null) {
        clearTimeout(jumpTimer.current);
      }
      jumpTimer.current = setTimeout(endJump, 260);
    }
    if (props.haptics) {
      if (tickTimer.current !== null) {
        clearTimeout(tickTimer.current);
      }
      tickTimer.current = setTimeout(async () => {
        tickTimer.current = null;
        await selectionTick();
      }, 0);
    }
  }, [value, props.haptics, endJump]);
  useEffect(
    () => () => {
      for (const timer of [closeTimer, jumpTimer, tickTimer]) {
        if (timer.current !== null) {
          clearTimeout(timer.current);
        }
      }
    },
    []
  );
  return { close, onValueChange, open, setOpen, value };
};
