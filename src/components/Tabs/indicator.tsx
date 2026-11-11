import { View } from "@tarojs/components";
import { useEffect, useRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSpringNumber } from "../../hooks/use-spring-number";
import { useTabs } from "./context";
import { tabsVariants } from "./variants";

export const TabsIndicator = ({ className }: { className?: string }) => {
  const { value, layouts, variant, animationDisabled } = useTabs("Tabs.List");
  const initialized = useRef(false);
  const reduced = usePanelReducedMotion();
  const layout = layouts[value];
  useEffect(() => {
    if (layout) {
      initialized.current = true;
    }
  }, [layout]);
  const still = reduced || animationDisabled || !initialized.current;
  const config = { damping: 24, mass: 0.7, stiffness: 300 };
  const x = useSpringNumber(layout?.x ?? 0, config, still);
  const width = useSpringNumber(layout?.width ?? 0, config, still);
  return (
    <View
      aria-hidden
      className={tabsVariants({ variant }).indicator({ className })}
      style={{
        opacity: layout ? 1 : 0,
        pointerEvents: "none",
        transform: `translateX(${x.value * 2}rpx)`,
        width: `${width.value * 2}rpx`,
      }}
    />
  );
};
