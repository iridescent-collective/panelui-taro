import { ScrollView, View } from "@tarojs/components";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { PANEL_IN, PANEL_OUT } from "./constants";
import type { SearchBarPanelPlacement } from "./types";
import { searchBarVariants } from "./variants";

const usePanelPresence = (open: boolean) => {
  const [retained, setRetained] = useState(open);
  useEffect(() => {
    if (open) {
      setRetained(true);
      return;
    }
    if (!retained) {
      return;
    }
    const timer = setTimeout(() => setRetained(false), PANEL_OUT);
    return () => clearTimeout(timer);
  }, [open, retained]);
  return open || retained;
};
const SearchPanelList = ({
  id,
  height,
  open,
  children,
  retainFocus,
}: {
  id: string;
  height: number;
  open: boolean;
  children?: ReactNode;
  retainFocus: () => void;
}) => {
  const slots = searchBarVariants();
  const measured = useElementLayout(true, children, `${id}-content`, false);
  const natural = measured.layout?.height;
  return (
    <ScrollView
      id={id}
      scrollY
      enhanced
      showScrollbar={false}
      bounces={false}
      onTouchStart={retainFocus}
      style={{
        height:
          natural === undefined
            ? undefined
            : `${Math.min(natural, height) * 2}rpx`,
        maxHeight: `${height * 2}rpx`,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <View id={measured.id} className={slots.panelList()}>
        {children}
      </View>
    </ScrollView>
  );
};
export const SearchPanel = ({
  id,
  open,
  placement,
  height,
  fieldHeight,
  children,
  retainFocus,
}: {
  id: string;
  open: boolean;
  placement: SearchBarPanelPlacement;
  height: number;
  fieldHeight: number;
  children?: ReactNode;
  retainFocus: () => void;
}) => {
  const mounted = usePanelPresence(open);
  const reduced = usePanelReducedMotion();
  const progress = useTimingNumber(
    Number(open),
    open ? PANEL_IN : PANEL_OUT,
    reduced,
    0
  );
  const retained = useRef(children);
  if (open) {
    retained.current = children;
  }
  const slots = searchBarVariants();
  if (!mounted) {
    return null;
  }
  const list = (
    <SearchPanelList
      key="list"
      id={`${id}-list`}
      height={height}
      open={open}
      retainFocus={retainFocus}
    >
      {retained.current}
    </SearchPanelList>
  );
  const divider = (
    <View
      key="divider"
      aria-hidden
      className={slots.panelDivider()}
      style={{ height: "1px", pointerEvents: "none" }}
    />
  );
  const spacer = (
    <View
      key="field"
      aria-hidden
      style={{ height: `${fieldHeight * 2}rpx`, pointerEvents: "none" }}
    />
  );
  return (
    <View
      id={id}
      aria-hidden={!open}
      className={slots.panel()}
      style={{
        bottom: placement === "top" ? 0 : undefined,
        left: 0,
        opacity: progress,
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: placement === "bottom" ? 0 : undefined,
        zIndex: 0,
      }}
    >
      {placement === "top" ? [list, divider, spacer] : [spacer, divider, list]}
    </View>
  );
};
