import { View } from "@tarojs/components";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { textChildren } from "../primitives/Text";
import { CAROUSEL_SPRING } from "./constants";
import { CarouselContext } from "./context";
import { useCarouselAutoplay, useCarouselIndexLifecycle } from "./lifecycle";
import { carouselDistance, normalizeCarouselIndex } from "./math";
import type { CarouselHandle, CarouselProps } from "./types";
import { useCarouselEngaged } from "./use-engaged";
import { useCarouselPan } from "./use-pan";

export const CarouselRoot = forwardRef<CarouselHandle, CarouselProps>(
  (
    {
      className,
      variant = "default",
      orientation = "horizontal",
      loop = false,
      align = "center",
      itemSize: itemSizeProp,
      autoplay = false,
      autoplayInterval = 4000,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      scrollEnabled = true,
      children,
      id,
      onLayout,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      ...props
    },
    ref
  ) => {
    const [count, setCountValue] = useState(0);
    const [countKnown, setCountKnown] = useState(false);
    const [touched, setTouched] = useState(false);
    const reduced = usePanelReducedMotion();
    const measured = useElementLayout(true, children, id);
    const state = useControllableState({
      defaultValue: defaultIndex,
      onChange: onIndexChange,
      value: indexProp,
    });
    const axis = variant === "stack" ? "horizontal" : orientation;
    const itemSize =
      itemSizeProp ??
      (axis === "horizontal"
        ? measured.layout?.width
        : measured.layout?.height) ??
      0;
    const pendingWrap = useRef<{ target: number; count: number } | null>(null);
    const springRef = useRef<ReturnType<
      typeof useSourceSpringController
    > | null>(null);
    const initialIndex = indexProp ?? defaultIndex;
    const progress = useSourceSpringController(
      Number.isFinite(initialIndex) ? initialIndex : 0,
      CAROUSEL_SPRING,
      reduced,
      (value) => {
        if (pendingWrap.current && value === pendingWrap.current.target) {
          const wrapped = normalizeCarouselIndex(
            value,
            pendingWrap.current.count,
            true
          );
          pendingWrap.current = null;
          springRef.current?.setImmediate(wrapped);
        }
      }
    );
    springRef.current = progress;
    const engaged = useCarouselEngaged(reduced);
    const animatedTarget = useRef<number | null>(null);
    const animateTo = useCallback(
      (target: number) => {
        animatedTarget.current = target;
        pendingWrap.current = null;
        if (reduced) {
          progress.setImmediate(target);
          return;
        }
        const shortest = loop
          ? progress.read() +
            carouselDistance(target, progress.read(), count, true)
          : target;
        if (loop) {
          pendingWrap.current = { count, target: shortest };
        }
        progress.springTo(shortest);
      },
      [
        count,
        loop,
        reduced,
        progress.read,
        progress.setImmediate,
        progress.springTo,
      ]
    );
    const settleIndex = useCallback(
      (next: number) => {
        if (animatedTarget.current === next) {
          return;
        }
        if (Math.abs(progress.read() - next) >= 0.001) {
          animateTo(next);
        }
      },
      [animateTo, progress.read]
    );
    const index = useCarouselIndexLifecycle({
      count,
      countKnown,
      loop,
      onCorrection: state.setValue,
      onSettledIndex: settleIndex,
      requestedIndex: state.value,
    });
    const scrollTo = useCallback(
      (target: number) => {
        if (count <= 0) {
          return;
        }
        const settled = normalizeCarouselIndex(target, count, loop);
        animateTo(state.isControlled ? index : settled);
        state.setValue(settled);
      },
      [animateTo, count, index, loop, state.isControlled, state.setValue]
    );
    const next = useCallback(() => scrollTo(index + 1), [index, scrollTo]);
    const previous = useCallback(() => scrollTo(index - 1), [index, scrollTo]);
    useImperativeHandle(ref, () => ({ next, previous, scrollTo }), [
      next,
      previous,
      scrollTo,
    ]);
    useCarouselAutoplay({
      count,
      enabled: autoplay && !touched,
      index,
      interval: autoplayInterval,
      loop,
      onAdvance: scrollTo,
    });
    const settle = useCallback(
      (target: number) => {
        setTouched(true);
        scrollTo(target);
      },
      [scrollTo]
    );
    const pan = useCarouselPan({
      axis,
      begin: () => {
        setTouched(true);
        pendingWrap.current = null;
        animatedTarget.current = null;
        const from = progress.read();
        progress.setImmediate(from);
        engaged.set(1);
        return from;
      },
      count,
      enabled: scrollEnabled,
      finish: (target) => {
        engaged.set(0);
        scrollTo(target ?? index);
      },
      itemSize,
      loop,
      update: progress.setImmediate,
    });
    const setCount = useCallback((value: number) => {
      setCountValue(value);
      setCountKnown(true);
    }, []);
    useEffect(() => {
      if (measured.layout) {
        onLayout?.({
          nativeEvent: {
            layout: {
              height: measured.layout.height,
              width: measured.layout.width,
              x: measured.layout.left,
              y: measured.layout.top,
            },
          },
        });
      }
    }, [measured.layout, onLayout]);
    const context = useMemo(
      () => ({
        align,
        count,
        engaged: engaged.signal,
        index,
        itemSize,
        loop,
        next,
        orientation: axis,
        previous,
        progress: progress.signal,
        scrollTo: settle,
        setCount,
        variant,
      }),
      [
        progress.signal,
        engaged.signal,
        count,
        setCount,
        index,
        settle,
        next,
        previous,
        variant,
        axis,
        align,
        loop,
        itemSize,
      ]
    );
    return (
      <CarouselContext.Provider value={context}>
        <View
          {...props}
          id={measured.id}
          aria-role="list"
          role="list"
          className={cn("w-full", className)}
          catchMove={pan.active}
          onTouchStart={(event) => {
            onTouchStart?.(event);
            pan.onTouchStart(event);
          }}
          onTouchMove={(event) => {
            onTouchMove?.(event);
            pan.onTouchMove(event);
          }}
          onTouchEnd={(event) => {
            onTouchEnd?.(event);
            pan.onTouchEnd(event);
          }}
          onTouchCancel={(event) => {
            onTouchCancel?.(event);
            pan.onTouchCancel();
          }}
        >
          {textChildren(children)}
        </View>
      </CarouselContext.Provider>
    );
  }
);
CarouselRoot.displayName = "Carousel";
