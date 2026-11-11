import { useCallback, useEffect, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePopoverAnchor } from "../Popover";
import type { SelectProps } from "./types";

export const useSelectController = ({
  children,
  disabled,
  presentation,
  onOpenChange,
}: SelectProps) => {
  const [query, setQuery] = useState("");
  const pending = useRef(0);
  const configuration = useRef({ disabled, presentation });
  configuration.current = { disabled, presentation };
  const mounted = useRef(true);
  const { anchorTo, open, setOpen } = usePopoverAnchor("Select");
  const measurement = useElementLayout(false, children);
  const previousOpen = useRef(open);
  useEffect(() => {
    if (previousOpen.current === open) {
      return;
    }
    previousOpen.current = open;
    if (!open) {
      pending.current += 1;
      setQuery("");
    }
    onOpenChange?.(open);
  }, [open, onOpenChange]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      pending.current += 1;
    };
  }, []);
  const close = useCallback(() => {
    pending.current += 1;
    setOpen(false);
    setQuery("");
  }, [setOpen]);
  const toggle = () => {
    if (disabled) {
      return;
    }
    if (open) {
      close();
      return;
    }
    pending.current += 1;
    const request = pending.current;
    const show = () => {
      setOpen(true);
    };
    if (presentation !== "overlay") {
      show();
      return;
    }
    measurement.refresh(
      () =>
        mounted.current &&
        pending.current === request &&
        !configuration.current.disabled &&
        configuration.current.presentation === "overlay",
      (rect) => {
        if (rect) {
          anchorTo({
            height: rect.height,
            width: rect.width,
            x: rect.left,
            y: rect.top,
          });
          show();
        }
      }
    );
  };
  return { close, open, query, setQuery, toggle, triggerId: measurement.id };
};
