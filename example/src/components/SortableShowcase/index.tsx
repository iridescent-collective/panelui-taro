import { ScrollView, View } from "@tarojs/components";
import {
  createSelectorQuery,
  getCurrentInstance,
  nextTick,
} from "@tarojs/taro";
import { Button } from "panelui-taro/button";
import { Sortable } from "panelui-taro/sortable";
import type { SortableScrollHandle } from "panelui-taro/sortable";
import { Typography } from "panelui-taro/typography";
import { useEffect, useRef, useState } from "react";

const INITIAL_ROWS = [
  "Reading",
  "Pinned",
  "Music",
  "Language",
  "Science",
  "Drawing",
  "Stories",
  "Review",
];
export const SortableShowcase = () => {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [longPress, setLongPress] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const metrics = useRef({ height: 0, offset: 0, pageY: 0 });
  const [scope] = useState(() => getCurrentInstance().page);
  const scrollRef = useRef<SortableScrollHandle>({
    readNativeMetrics: () =>
      metrics.current.height > 0 ? metrics.current : null,
    scrollToNative: setScrollTop,
  });
  useEffect(() => {
    nextTick(() => {
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      query
        .select("#panel-sortable-scroll")
        .boundingClientRect((rect) => {
          if (rect && !Array.isArray(rect)) {
            metrics.current = {
              ...metrics.current,
              height: rect.height,
              pageY: rect.top,
            };
          }
        })
        .exec();
    });
  }, [scope, longPress]);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-sortable-result">
        {JSON.stringify({ longPress, rows })}
      </Typography>
      <Button variant="outline" onPress={() => setLongPress(!longPress)}>
        {longPress ? "Use handles" : "Use long press"}
      </Button>
      <ScrollView
        id="panel-sortable-scroll"
        enhanced
        scrollY
        scrollTop={scrollTop}
        className="h-[480px]"
        onScroll={(event) => {
          metrics.current.offset = event.detail.scrollTop;
        }}
      >
        <Sortable
          value={rows}
          gap={8}
          activation={longPress ? "longPress" : "handle"}
          scrollRef={scrollRef}
          onReorder={setRows}
        >
          {rows.map((label) => (
            <Sortable.Item
              key={label}
              id={label}
              pinned={label === "Pinned"}
              className="flex h-[120px] flex-row items-center justify-between rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] px-[24px]"
            >
              <Typography>{label}</Typography>
              <Sortable.Handle accessibilityLabel={`Move ${label}`} />
            </Sortable.Item>
          ))}
        </Sortable>
      </ScrollView>
    </View>
  );
};
