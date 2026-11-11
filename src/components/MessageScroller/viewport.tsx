import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo, nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { TranscriptContentContext, useScroller } from "./context";
import {
  ANCHOR_PEEK,
  SCROLL_SETTLE_DELAY,
  anchorAtOffset,
  distanceFromMessageScrollerTarget,
  isMessageScrollerTargetVisible,
  topmostShift,
  visibleReaderShift,
  lastScrollerAnchor,
} from "./math";
import type { MessageScrollerViewportProps } from "./types";
import { useNativeScroll } from "./use-native-scroll";
import { useNativeScrollOffset } from "./use-native-scroll-offset";

type ModelScrollIntent =
  | { kind: "message"; id: string }
  | { kind: "start" }
  | { kind: "end" }
  | { kind: "offset" };
interface PendingModelMove {
  intent: ModelScrollIntent;
  target: number;
  animated: boolean;
}
const resolveModelTarget = (
  intent: ModelScrollIntent,
  model: TranscriptDriverModel,
  viewportHeight: number,
  nativeHeight?: number
): number | undefined => {
  if (intent.kind === "message") {
    const y = model.position(intent.id);
    return y === undefined ? undefined : Math.max(0, y - ANCHOR_PEEK);
  }
  if (intent.kind === "start") {
    return 0;
  }
  if (intent.kind === "end") {
    return Math.max(0, (nativeHeight ?? model.height) - viewportHeight);
  }
  return undefined;
};
export interface TranscriptDriverModel {
  height: number;
  bindContent?: (id: string | null) => void;
  position: (id: string) => number | undefined;
  lastAnchor: () => string | undefined;
  anchor: (offset: number) => string | null;
  onOffset?: (offset: number, viewport: number) => void;
}
const reconcilePendingModelMove = (
  model: TranscriptDriverModel | undefined,
  pending: PendingModelMove | null,
  viewportHeight: number,
  nativeHeight: number | undefined,
  actions: {
    move: (
      target: number,
      animated: boolean,
      intent: ModelScrollIntent
    ) => void;
    cancel: () => void;
  }
): boolean => {
  if (!model || !pending || pending.intent.kind === "offset") {
    return false;
  }
  const target = resolveModelTarget(
    pending.intent,
    model,
    viewportHeight,
    nativeHeight
  );
  if (target === undefined) {
    actions.cancel();
    return false;
  }
  if (target !== pending.target) {
    actions.move(target, pending.animated, pending.intent);
  }
  return true;
};
const followNativeContentChange = (
  model: TranscriptDriverModel | undefined,
  following: boolean,
  nativeChanged: boolean,
  hadNativeHeight: boolean,
  scrollToEnd: (animated: boolean) => void
): boolean => {
  if (!model || !following) {
    return false;
  }
  if (nativeChanged) {
    scrollToEnd(hadNativeHeight);
  }
  return true;
};
const contentExtent = (
  model: TranscriptDriverModel | undefined,
  height: number | undefined
) => model?.height ?? height;
const recordNativeHeight = (
  height: number | undefined,
  previous: { current: number | undefined }
) => {
  const state = {
    changed: height !== undefined && height !== previous.current,
    measured: previous.current !== undefined,
  };
  previous.current = height;
  return state;
};
const plainRowsPending = (
  model: TranscriptDriverModel | undefined,
  count: number
) => !model && count > 0;
const unchangedPlainContent = (
  model: TranscriptDriverModel | undefined,
  opened: boolean,
  height: number,
  previous: number
) => opened && !model && height === previous;
export const MessageScrollerViewport = ({
  className,
  children,
  model,
  contentClassName,
  ...props
}: MessageScrollerViewportProps & {
  model?: TranscriptDriverModel;
  contentClassName?: string;
}) => {
  const context = useScroller("MessageScroller.Viewport");
  const {
    rows,
    pendingRows,
    rowRevision,
    offset,
    viewport,
    content,
    distanceFromStart,
    distanceFromEnd,
    following,
    driver,
    setCurrentAnchorId,
    setAtEndJS,
    autoScroll,
    preserveScrollOnPrepend,
    defaultScrollPosition,
  } = context;
  const measurement = useElementLayout(true, children, props.id, false);
  const nativeScroll = useNativeScroll(measurement.id);
  const readNativeOffset = useNativeScrollOffset(measurement.id);
  const contentId = `panel-messages-content-${useId().replaceAll(":", "")}`;
  const contentLayout = useElementLayout(true, children, contentId, false);
  const bindContent = model?.bindContent;
  useEffect(() => {
    bindContent?.(contentId);
    return () => bindContent?.(null);
  }, [bindContent, contentId]);
  const [requested, setRequested] = useState<number>();
  const [animated, setAnimated] = useState(false);
  const latest = useRef({
    context,
    model,
    nativeHeight: contentLayout.layout?.height,
  });
  latest.current = {
    context,
    model,
    nativeHeight: contentLayout.layout?.height,
  };
  const request = useRef(0);
  const settlementVersion = useRef(0);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opened = useRef(false);
  const previousHeight = useRef(0);
  const previousNativeHeight = useRef<number | undefined>();
  const previousY = useRef(new Map<string, number>());
  const atEnd = useRef(true);
  const programmaticModelScroll = useRef(false);
  const pendingModelMove = useRef<PendingModelMove | null>(null);
  const move = useCallback(
    (y: number, animation: boolean, intent?: ModelScrollIntent) => {
      settlementVersion.current += 1;
      if (intent) {
        programmaticModelScroll.current = Boolean(latest.current.model);
      }
      pendingModelMove.current = latest.current.model
        ? {
            animated: animation,
            intent: intent ?? { kind: "offset" },
            target: Math.max(0, y),
          }
        : null;
      request.current += 1;
      const version = request.current;
      const pixel = getWindowInfo().windowWidth / 375;
      nextTick(() => {
        if (mounted.current && version === request.current) {
          nativeScroll(
            Math.max(0, y) * pixel,
            animation,
            () => mounted.current && version === request.current,
            () => {
              setAnimated(animation);
              setRequested(offset.value * pixel);
              nextTick(() => {
                if (mounted.current && version === request.current) {
                  setRequested(Math.max(0, y) * pixel);
                }
              });
            },
            () => setRequested(undefined)
          );
        }
      });
    },
    [offset, nativeScroll]
  );
  const refreshEdges = useCallback(
    (height: number, syncFollowing = false) => {
      distanceFromStart.value = distanceFromMessageScrollerTarget(
        "start",
        offset.value,
        height,
        viewport.value
      );
      distanceFromEnd.value = distanceFromMessageScrollerTarget(
        "end",
        offset.value,
        height,
        viewport.value
      );
      const next = !isMessageScrollerTargetVisible(distanceFromEnd.value);
      if (syncFollowing) {
        following.current = latest.current.context.autoScroll && next;
      }
      if (next !== atEnd.current) {
        atEnd.current = next;
        setAtEndJS(next);
      }
    },
    [
      distanceFromStart,
      distanceFromEnd,
      offset,
      viewport,
      following,
      setAtEndJS,
    ]
  );
  const publishSettlement = useCallback(() => {
    const { current } = latest;
    if (current.model && programmaticModelScroll.current) {
      return;
    }
    setCurrentAnchorId(
      current.model
        ? current.model.anchor(offset.value)
        : anchorAtOffset(rows, offset.value, 375 / getWindowInfo().windowWidth)
    );
  }, [rows, offset, setCurrentAnchorId]);
  const settle = useCallback(() => {
    if (latest.current.model) {
      publishSettlement();
      return;
    }
    settlementVersion.current += 1;
    const version = settlementVersion.current;
    readNativeOffset((native) => {
      if (!mounted.current || version !== settlementVersion.current) {
        return;
      }
      if (native) {
        const scale = 375 / getWindowInfo().windowWidth;
        offset.value = native.top * scale;
        refreshEdges(
          native.height === undefined ? content.value : native.height * scale
        );
      }
      publishSettlement();
    });
  }, [readNativeOffset, publishSettlement, offset, content, refreshEdges]);
  useEffect(() => {
    mounted.current = true;
    const control = {
      scrollToEnd: (animation: boolean) => {
        const height = latest.current.model
          ? (latest.current.nativeHeight ?? content.value)
          : content.value;
        move(Math.max(0, height - viewport.value), animation, {
          kind: "end",
        });
        if (latest.current.model) {
          setCurrentAnchorId(latest.current.model.anchor(Infinity));
        }
      },
      scrollToMessage: (id: string, animation: boolean) => {
        const y = latest.current.model?.position(id) ?? rows.get(id)?.y;
        if (y === undefined) {
          return false;
        }
        move(Math.max(0, y - ANCHOR_PEEK), animation, { id, kind: "message" });
        if (latest.current.model) {
          setCurrentAnchorId(latest.current.model.anchor(y));
        }
        return true;
      },
      scrollToStart: (animation: boolean) => {
        move(0, animation, { kind: "start" });
        if (latest.current.model) {
          setCurrentAnchorId(latest.current.model.anchor(0));
        }
      },
    };
    driver.current = control;
    return () => {
      mounted.current = false;
      settlementVersion.current += 1;
      request.current += 1;
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
      if (driver.current === control) {
        driver.current = null;
      }
    };
  }, [
    driver,
    move,
    rows,
    content,
    viewport,
    setCurrentAnchorId,
    nativeScroll,
    offset,
  ]);
  useEffect(() => {
    following.current = autoScroll && atEnd.current;
    if (!autoScroll && pendingModelMove.current?.intent.kind === "end") {
      pendingModelMove.current = null;
      programmaticModelScroll.current = false;
      settlementVersion.current += 1;
      request.current += 1;
    }
  }, [autoScroll, following]);
  useEffect(() => {
    if (measurement.layout) {
      viewport.value = measurement.layout.height;
      refreshEdges(latest.current.nativeHeight ?? content.value);
    }
  }, [measurement.layout, viewport, content, refreshEdges]);
  const openAtInitialPosition = useCallback(() => {
    if (defaultScrollPosition === "end") {
      context.scrollToEnd(false);
    } else if (defaultScrollPosition === "last-anchor") {
      const anchor =
        latest.current.model?.lastAnchor() ?? lastScrollerAnchor(rows);
      if (anchor) {
        context.scrollToMessage(anchor, false);
      } else {
        context.scrollToEnd(false);
      }
    }
  }, [
    defaultScrollPosition,
    rows,
    context.scrollToEnd,
    context.scrollToMessage,
  ]);
  useEffect(() => {
    const height = contentExtent(model, contentLayout.layout?.height);
    if (height === undefined) {
      return;
    }
    const version = request.current;
    const edgeHeight = contentLayout.layout?.height ?? height;
    const currentMeasurement = () =>
      mounted.current &&
      version === request.current &&
      latest.current.model === model &&
      latest.current.nativeHeight === contentLayout.layout?.height;
    nextTick(() => {
      if (!currentMeasurement()) {
        return;
      }
      const nativeMeasurement = recordNativeHeight(
        contentLayout.layout?.height,
        previousNativeHeight
      );
      content.value = height;
      refreshEdges(edgeHeight);
      if (plainRowsPending(model, pendingRows.size)) {
        return;
      }
      if (
        unchangedPlainContent(
          model,
          opened.current,
          height,
          previousHeight.current
        )
      ) {
        settle();
        return;
      }
      const positions = new Map([...rows].map(([id, row]) => [id, row.y]));
      if (!opened.current) {
        opened.current = true;
        previousHeight.current = height;
        previousY.current = positions;
        openAtInitialPosition();
        return;
      }
      if (
        followNativeContentChange(
          model,
          following.current,
          nativeMeasurement.changed,
          nativeMeasurement.measured,
          context.scrollToEnd
        )
      ) {
        previousHeight.current = height;
        previousY.current = positions;
        return;
      }
      if (
        reconcilePendingModelMove(
          model,
          pendingModelMove.current,
          viewport.value,
          contentLayout.layout?.height,
          {
            cancel: () => {
              pendingModelMove.current = null;
              programmaticModelScroll.current = false;
            },
            move,
          }
        )
      ) {
        previousHeight.current = height;
        previousY.current = positions;
        return;
      }
      const grew = height - previousHeight.current;
      if (model ? true : grew > 0) {
        if (following.current) {
          context.scrollToEnd(true);
        } else if (preserveScrollOnPrepend) {
          const readerOffset = model
            ? (pendingModelMove.current?.target ?? offset.value)
            : offset.value;
          const shift = model
            ? visibleReaderShift(previousY.current, positions, readerOffset)
            : topmostShift(previousY.current, positions);
          if (model ? Math.abs(shift) > 0.5 : shift > 0.5) {
            move(readerOffset + shift, false);
          }
        }
      }
      previousHeight.current = height;
      previousY.current = positions;
      settle();
    });
  }, [
    model,
    openAtInitialPosition,
    pendingRows,
    rowRevision,
    contentLayout.layout?.height,
    rows,
    content,
    refreshEdges,
    defaultScrollPosition,
    preserveScrollOnPrepend,
    following,
    offset,
    move,
    settle,
    context.scrollToEnd,
    context.scrollToMessage,
  ]);
  const quietSettle = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      settle();
    }, SCROLL_SETTLE_DELAY);
  };
  return (
    <ScrollView
      {...props}
      id={measurement.id}
      aria-label="Messages"
      aria-role="list"
      scrollY
      enhanced
      showScrollbar={false}
      className={cn("min-h-[0px] flex-1", className)}
      scrollTop={requested}
      scrollWithAnimation={animated}
      onScroll={(event) => {
        settlementVersion.current += 1;
        const scale = 375 / getWindowInfo().windowWidth;
        offset.value = event.detail.scrollTop * scale;
        content.value = event.detail.scrollHeight * scale;
        const pending = pendingModelMove.current;
        if (pending !== null) {
          const maximum = Math.max(0, content.value - viewport.value);
          const target = Math.min(maximum, pending.target);
          if (
            pending.intent.kind !== "message" &&
            (maximum > scale || pending.target <= scale) &&
            Math.abs(offset.value - target) <= scale
          ) {
            pendingModelMove.current = null;
          }
        }
        refreshEdges(content.value, true);
        model?.onOffset?.(offset.value, viewport.value);
        quietSettle();
        props.onScroll?.(event);
      }}
      onScrollEnd={(event) => {
        settle();
        props.onScrollEnd?.(event);
      }}
      onTouchStart={(event) => {
        settlementVersion.current += 1;
        request.current += 1;
        programmaticModelScroll.current = false;
        pendingModelMove.current = null;
        props.onTouchStart?.(event);
      }}
      onDragStart={(event) => {
        settlementVersion.current += 1;
        request.current += 1;
        programmaticModelScroll.current = false;
        pendingModelMove.current = null;
        props.onDragStart?.(event);
      }}
      onTouchEnd={(event) => {
        settle();
        props.onTouchEnd?.(event);
      }}
      onDragEnd={(event) => {
        settle();
        props.onDragEnd?.(event);
      }}
    >
      <TranscriptContentContext.Provider value={contentId}>
        <View id={contentId} className={contentClassName}>
          {textChildren(children)}
        </View>
      </TranscriptContentContext.Provider>
    </ScrollView>
  );
};
MessageScrollerViewport.displayName = "MessageScroller.Viewport";
