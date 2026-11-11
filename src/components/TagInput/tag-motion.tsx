import { View } from "@tarojs/components";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import type { ElementLayout } from "../../hooks/use-element-layout";
import { easeInOutQuad } from "../../lib/easing";

export interface TagOffset {
  x: number;
  y: number;
}
export const reflowOffset = (
  before: ElementLayout,
  offset: TagOffset,
  after: ElementLayout
): TagOffset => ({
  x: before.left + offset.x - after.left,
  y: before.top + offset.y - after.top,
});
export const TagMotion = ({
  children,
  present,
  reduced,
  container,
}: {
  children: ReactNode;
  present: boolean;
  reduced: boolean;
  container: ElementLayout | null;
}) => {
  const input = useMemo(() => ({ children, present }), [children, present]);
  const measured = useElementLayout(true, input, undefined, false);
  const previous = useRef<ElementLayout | null>(null);
  const currentOffset = useRef<TagOffset>({ x: 0, y: 0 });
  const [offset, setOffset] = useState(currentOffset.current);
  useEffect(() => {
    if (!measured.layout || !present) {
      return;
    }
    const before = previous.current;
    previous.current = measured.layout;
    if (!before || reduced) {
      currentOffset.current = { x: 0, y: 0 };
      setOffset(currentOffset.current);
      return;
    }
    const origin = reflowOffset(before, currentOffset.current, measured.layout);
    if (Math.abs(origin.x) < 0.01 && Math.abs(origin.y) < 0.01) {
      return;
    }
    currentOffset.current = origin;
    setOffset(origin);
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / 180);
      const fraction = 1 - easeInOutQuad(progress);
      currentOffset.current = {
        x: origin.x * fraction,
        y: origin.y * fraction,
      };
      setOffset(currentOffset.current);
      if (progress === 1) {
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [measured.layout, present, reduced]);
  const last = previous.current;
  const style: CSSProperties = {};
  if (!present && last && container) {
    style.position = "absolute";
    style.left = `${(last.left - container.left) * 2}rpx`;
    style.top = `${(last.top - container.top) * 2}rpx`;
    style.width = `${last.width * 2}rpx`;
    style.height = `${last.height * 2}rpx`;
  }
  if (!present) {
    style.pointerEvents = "none";
  }
  let className: string | undefined;
  if (!reduced) {
    className = present ? "panelui-tag-enter" : "panelui-tag-exit";
  }
  return (
    <View id={measured.id} style={style} aria-hidden={!present}>
      <View
        className={className}
        style={{
          transform: `translate(${offset.x * 2}rpx, ${offset.y * 2}rpx)`,
        }}
      >
        {children}
      </View>
    </View>
  );
};
