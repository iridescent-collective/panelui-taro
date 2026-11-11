import { useCallback, useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import type { SectionProgressProps } from "./types";

export const useSectionProgressState = (props: SectionProgressProps) => {
  const [internalValue, setValue] = useState(props.defaultValue);
  const [internalOpen, setInternalOpen] = useState(props.defaultOpen ?? false);
  const value = props.value ?? internalValue;
  const open = props.open ?? internalOpen;
  const latest = useRef(props);
  latest.current = props;
  const jump = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endJump = useCallback(() => {
    jump.current = null;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const setOpen = useCallback((next: boolean) => {
    if (latest.current.open === undefined) {
      setInternalOpen(next);
    }
    latest.current.onOpenChange?.(next);
  }, []);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const onValueChange = useCallback(
    (next: string) => {
      endJump();
      jump.current = next;
      timer.current = setTimeout(endJump, 900);
      if (latest.current.value === undefined) {
        setValue(next);
      }
      latest.current.onValueChange?.(next);
      setOpen(false);
    },
    [endJump, setOpen]
  );
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (jump.current !== null) {
      if (value !== jump.current) {
        return;
      }
      endJump();
    }
    if (props.haptics) {
      if (tick.current !== null) {
        clearTimeout(tick.current);
      }
      tick.current = setTimeout(async () => {
        tick.current = null;
        await selectionTick();
      }, 0);
    }
  }, [value, props.haptics, endJump]);
  useEffect(
    () => () => {
      endJump();
      if (tick.current !== null) {
        clearTimeout(tick.current);
      }
    },
    [endJump]
  );
  return { close, onValueChange, open, setOpen, value };
};
