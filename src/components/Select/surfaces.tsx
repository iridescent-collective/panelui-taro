import { ScrollView, View } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { BottomSheet } from "../BottomSheet";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import { SelectContext } from "./context";
import type { SelectContextValue } from "./context";
import type { SelectProps } from "./types";
import { selectVariants } from "./variants";

const InlineSurface = ({
  open,
  className,
  children,
}: {
  open: boolean;
  className: string;
  children: ReactNode;
}) => {
  const reduced = usePanelReducedMotion();
  const present = usePresence(open, 120);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let current = true;
    if (open) {
      nextTick(() => {
        if (current) {
          setShown(true);
        }
      });
    } else {
      setShown(false);
    }
    return () => {
      current = false;
    };
  }, [open]);
  return present ? (
    <View
      className={className}
      aria-hidden={!open}
      style={{
        opacity: Number(open && (shown || reduced)),
        pointerEvents: open ? "auto" : "none",
        transition: reduced ? "none" : `opacity ${open ? 140 : 120}ms ease`,
      }}
    >
      {children}
    </View>
  ) : null;
};

export const SelectSurface = ({
  props,
  open,
  close,
  context,
  search,
  options,
}: {
  props: SelectProps;
  open: boolean;
  close: () => void;
  context: SelectContextValue;
  search: ReactNode;
  options: ReactNode;
}) => {
  const {
    presentation = "sheet",
    contentWidth = "trigger",
    offset = 8,
    listClassName,
    sheetProps,
    title,
  } = props;
  const slots = selectVariants({ presentation });
  if (presentation === "sheet") {
    return (
      <BottomSheet
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            close();
          }
        }}
        native={sheetProps?.native}
        snapPoints={sheetProps?.snapPoints}
        nativeBackground={sheetProps?.nativeBackground}
      >
        <BottomSheet.Content size={sheetProps?.size ?? "auto"}>
          <SelectContext.Provider value={context}>
            {title ? (
              <Text size="lg" weight="semibold" className="mb-[16px] px-[24px]">
                {title}
              </Text>
            ) : null}
            {search ? <View className="px-[8px]">{search}</View> : null}
            <BottomSheet.Body
              bounces={false}
              className={
                (sheetProps?.size ?? "auto") === "auto"
                  ? "max-h-[768px]"
                  : undefined
              }
            >
              <View
                className={slots.options({
                  className: `flex flex-col ${listClassName ?? ""}`,
                })}
              >
                {options}
              </View>
            </BottomSheet.Body>
          </SelectContext.Provider>
        </BottomSheet.Content>
      </BottomSheet>
    );
  }
  if (presentation === "inline") {
    return (
      <InlineSurface
        open={open}
        className={slots.list({ className: listClassName })}
      >
        {search}
        {options}
      </InlineSurface>
    );
  }
  return (
    <Popover.Content
      modal
      dismissLabel={false}
      align="start"
      offset={offset}
      width={contentWidth === "content" ? "content-fit" : contentWidth}
      className={slots.list({ className: `gap-0 ${listClassName ?? ""}` })}
      style={{
        transform: "none",
        transition: `opacity ${open ? 140 : 120}ms ease`,
      }}
    >
      <SelectContext.Provider value={context}>
        {search}
        <ScrollView
          scrollY
          enhanced
          bounces={false}
          showScrollbar={false}
          className="min-h-0 shrink"
          style={{ maxHeight: "768rpx" }}
        >
          {options}
        </ScrollView>
      </SelectContext.Provider>
    </Popover.Content>
  );
};
