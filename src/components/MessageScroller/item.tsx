import { View } from "@tarojs/components";
import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import { useContext, useEffect, useState, useSyncExternalStore } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { weappNodeSelector } from "../../platform/node-selector";
import { textChildren } from "../primitives/Text";
import { TranscriptContentContext, useScroller } from "./context";
import type { MessageScrollerItemProps } from "./types";

export const MessageScrollerItem = ({
  messageId,
  scrollAnchor = false,
  children,
  onLayout,
  ...props
}: MessageScrollerItemProps) => {
  const { content, registerItem, unregisterItem, registerPendingItem } =
    useScroller("MessageScroller.Item");
  const contentId = useContext(TranscriptContentContext);
  const contentHeight = useSyncExternalStore(
    content.subscribe,
    content.getSnapshot,
    content.getSnapshot
  );
  const measure = useElementLayout(
    true,
    [children, scrollAnchor],
    props.id,
    false
  );
  const [scope] = useState(() => getCurrentInstance().page);
  useEffect(
    () => registerPendingItem(messageId),
    [messageId, registerPendingItem]
  );
  useEffect(() => {
    let active = true;
    if (!measure.layout) {
      return;
    }
    nextTick(() => {
      if (!active) {
        return;
      }
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      let origin = 0;
      let originX = 0;
      let originMeasured = !contentId;
      let row: {
        top: number;
        left: number;
        width: number;
        height: number;
      } | null = null;
      if (contentId) {
        query
          .select(weappNodeSelector(contentId))
          .boundingClientRect((rect) => {
            if (rect && !Array.isArray(rect)) {
              origin = rect.top;
              originX = rect.left;
              originMeasured = true;
            }
          });
      }
      query.select(weappNodeSelector(measure.id)).boundingClientRect((rect) => {
        if (rect && !Array.isArray(rect)) {
          row = rect;
        }
      });
      query.exec(() => {
        if (!active || !row || !originMeasured) {
          return;
        }
        const scale = 375 / getWindowInfo().windowWidth;
        registerItem(messageId, {
          anchor: scrollAnchor,
          height: row.height * scale,
          y: (row.top - origin) * scale,
        });
        onLayout?.({
          nativeEvent: {
            layout: {
              height: row.height * scale,
              width: row.width * scale,
              x: (row.left - originX) * scale,
              y: (row.top - origin) * scale,
            },
          },
        });
      });
    });
    return () => {
      active = false;
    };
  }, [
    messageId,
    scrollAnchor,
    measure.id,
    measure.layout,
    contentId,
    contentHeight,
    registerItem,
    onLayout,
    scope,
  ]);
  useEffect(() => () => unregisterItem(messageId), [messageId, unregisterItem]);
  return (
    <View {...props} id={measure.id}>
      {textChildren(children)}
    </View>
  );
};
MessageScrollerItem.displayName = "MessageScroller.Item";
