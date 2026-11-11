import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo, nextTick } from "@tarojs/taro";
import { cloneElement, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";

import { useScrollHeader } from "./context";
import { contentInset, snapTarget } from "./math";
import type { HeaderScrollableProps } from "./types";

const dimensionStyle = (value: unknown) =>
  typeof value === "number" ? `${value * 2}rpx` : value;
const scale = () => 375 / getWindowInfo().windowWidth;
const DIMENSION_KEY =
  /^(?:padding|margin|gap|rowGap|columnGap|top|bottom|left|right|width|height|minWidth|maxWidth|minHeight|maxHeight|fontSize|borderWidth)/u;
const contentStyle = (
  own: HeaderScrollableProps["contentContainerStyle"],
  inset: number
): CSSProperties => {
  const style: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(own ?? {})) {
    if (key !== "paddingVertical") {
      style[key] = DIMENSION_KEY.test(key) ? dimensionStyle(value) : value;
    }
  }
  if (own?.paddingVertical !== undefined) {
    style.paddingBottom = dimensionStyle(
      own.paddingBottom ?? own.paddingVertical
    );
  }
  style.paddingTop = `${inset * 2}rpx`;
  return style;
};
export const HeaderScrollable = ({
  child,
  size,
  snap,
}: {
  child: ReactElement<HeaderScrollableProps>;
  size: number;
  snap: boolean;
}) => {
  const { offset, largeHeight, barBand } = useScrollHeader("ScrollHeader");
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const latest = useRef({ child, snap });
  latest.current = { child, snap };
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const released = useRef(false);
  const touching = useRef(false);
  const stop = useCallback(() => {
    revision.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);
  const settle = useCallback(
    (velocity: number) => {
      stop();
      if (!latest.current.snap || touching.current) {
        return false;
      }
      const target = snapTarget(offset.value, largeHeight.value, velocity);
      if (target === null) {
        return false;
      }
      const pixelScale = getWindowInfo().windowWidth / 375;
      const request = revision.current;
      released.current = false;
      setScrollTop(offset.value * pixelScale);
      nextTick(() => {
        if (request === revision.current) {
          setScrollTop(target * pixelScale);
        }
      });
      return true;
    },
    [offset, largeHeight, stop]
  );
  const quietSettle = useCallback(() => {
    stop();
    if (!released.current || touching.current) {
      return;
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      settle(0);
    }, 160);
  }, [stop, settle]);
  useEffect(() => stop, [stop]);
  useEffect(() => {
    stop();
    setScrollTop(undefined);
  }, [child.props.scrollTop, stop]);
  useEffect(() => {
    if (!snap) {
      stop();
      setScrollTop(undefined);
    }
  }, [snap, stop]);
  const own = child.props.contentContainerStyle;
  const inset = contentInset(
    barBand + size,
    own?.paddingTop ?? own?.paddingVertical ?? own?.padding
  );
  const {
    contentContainerStyle: _contentContainerStyle,
    scrollIndicatorInsets: _scrollIndicatorInsets,
    scrollEventThrottle: _scrollEventThrottle,
    contentInsetAdjustmentBehavior: _contentInsetAdjustmentBehavior,
    ...native
  } = child.props;
  return cloneElement(
    child,
    {
      ...native,
      contentContainerStyle:
        child.type === ScrollView ? undefined : contentStyle(own, inset),
      contentInsetAdjustmentBehavior:
        child.type === ScrollView
          ? undefined
          : (child.props.contentInsetAdjustmentBehavior ?? "never"),
      enhanced: child.props.enhanced ?? true,
      onDragEnd: (event) => {
        touching.current = false;
        released.current = true;
        offset.value = event.detail.scrollTop * scale();
        if (!settle(event.detail.velocity * scale())) {
          quietSettle();
        }
        latest.current.child.props.onDragEnd?.(event);
      },
      onScroll: (event) => {
        offset.value = event.detail.scrollTop * scale();
        quietSettle();
        latest.current.child.props.onScroll?.(event);
      },
      onScrollEnd: (event) => {
        offset.value = event.detail.scrollTop * scale();
        released.current = false;
        settle(0);
        latest.current.child.props.onScrollEnd?.(event);
      },
      onTouchCancel: (event) => {
        touching.current = false;
        released.current = true;
        quietSettle();
        latest.current.child.props.onTouchCancel?.(event);
      },
      onTouchEnd: (event) => {
        touching.current = false;
        released.current = true;
        quietSettle();
        latest.current.child.props.onTouchEnd?.(event);
      },
      onTouchStart: (event) => {
        touching.current = true;
        released.current = false;
        stop();
        setScrollTop(undefined);
        latest.current.child.props.onTouchStart?.(event);
      },
      scrollEventThrottle:
        child.type === ScrollView
          ? undefined
          : (child.props.scrollEventThrottle ?? 16),
      scrollIndicatorInsets:
        child.type === ScrollView
          ? undefined
          : { top: barBand, ...child.props.scrollIndicatorInsets },
      scrollTop: scrollTop ?? child.props.scrollTop,
      scrollWithAnimation:
        scrollTop === undefined ? child.props.scrollWithAnimation : true,
    },
    child.type === ScrollView ? (
      <View style={contentStyle(own, inset)}>{child.props.children}</View>
    ) : (
      child.props.children
    )
  );
};
