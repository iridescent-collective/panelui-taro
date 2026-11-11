// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEffect } from "react";
import { it, expect, vi, beforeEach } from "vitest";

import {
  MessageScroller,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "../src/components/MessageScroller";
import type { MessageScrollerPosition } from "../src/components/MessageScroller";
import { useScroller } from "../src/components/MessageScroller/context";
import {
  distanceFromMessageScrollerTarget,
  isMessageScrollerTargetVisible,
  initialMessageScrollerIndex,
  messageScrollerAnchorAt,
  messageScrollerIndex,
  topmostShift,
  transcriptWindow,
} from "../src/components/MessageScroller/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/message-scroller-source.json";
import {
  setElementMeasurement,
  setTestMeasurement,
  emitTestResize,
  setElementComputedStyle,
  setElementFieldsResult,
} from "./taro-api";
import type { createSelectorQuery as CreateSelectorQueryMock } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const NATIVE_OFFSET = vi.hoisted(() => ({
  delayed: false,
  enabled: false,
  pending: [] as (() => void)[],
  top: 2141 as number | null,
}));
const NATIVE_SCROLL = vi.hoisted(() => ({
  delayed: false,
  enabled: false,
  noNodeApi: false,
  pending: [] as (() => void)[],
  scope: vi.fn(),
  scrollTo: vi.fn(),
}));
vi.mock("@tarojs/taro", async () => {
  const actual = await vi.importActual<{
    createSelectorQuery: typeof CreateSelectorQueryMock;
  }>("@tarojs/taro");
  return {
    ...actual,
    createSelectorQuery: () => {
      const query = actual.createSelectorQuery();
      const scoped = query.in;
      query.in = () => {
        NATIVE_SCROLL.scope();
        return scoped();
      };
      if (NATIVE_SCROLL.noNodeApi) {
        return query;
      }
      return Object.assign(query, {
        ...(NATIVE_OFFSET.enabled
          ? {
              scrollOffset: (
                accept: (
                  value: { scrollTop: number; scrollHeight: number } | null
                ) => void
              ) => {
                const { top } = NATIVE_OFFSET;
                const deliver = () =>
                  accept(
                    top === null ? null : { scrollHeight: 2650, scrollTop: top }
                  );
                if (NATIVE_OFFSET.delayed) {
                  NATIVE_OFFSET.pending.push(deliver);
                } else {
                  queueMicrotask(deliver);
                }
                return query;
              },
            }
          : {}),
        node: (accept: (result: unknown) => void) => {
          const deliver = () =>
            accept({
              node: NATIVE_SCROLL.enabled
                ? { scrollTo: NATIVE_SCROLL.scrollTo }
                : null,
            });
          if (NATIVE_SCROLL.delayed) {
            NATIVE_SCROLL.pending.push(deliver);
          } else {
            queueMicrotask(deliver);
          }
          return query;
        },
      });
    },
  };
});
beforeEach(() => {
  NATIVE_OFFSET.enabled = false;
  NATIVE_OFFSET.delayed = false;
  NATIVE_OFFSET.top = 2141;
  NATIVE_OFFSET.pending = [];
  NATIVE_SCROLL.enabled = false;
  NATIVE_SCROLL.delayed = false;
  NATIVE_SCROLL.noNodeApi = false;
  NATIVE_SCROLL.pending = [];
});

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const rect = (height: number, top = 0) => ({
  height,
  left: 0,
  top,
  width: 300,
});
const setupMeasure = (height: number) => {
  setElementMeasurement("chat", rect(200));
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Missing content");
  }
  setElementMeasurement(content.id, rect(height));
  setElementComputedStyle(content.id, {
    paddingBottom: "64px",
    paddingTop: "16px",
  });
};
const scroll = () => {
  const node = document.querySelector("#chat");
  if (!node) {
    throw new Error("Missing chat");
  }
  return node;
};
const readTop = () => Number(scroll().getAttribute("scrollTop"));
const issueScroll = (offset: number, height: number) =>
  act(() =>
    dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scroll, {
      scrollHeight: height,
      scrollLeft: 0,
      scrollTop: offset,
      scrollWidth: 300,
    })
  );
const Probe = ({ animated = false }: { animated?: boolean }) => {
  const controls = useMessageScroller();
  const visibility = useMessageScrollerVisibility();
  return (
    <>
      <span data-testid="visibility">{JSON.stringify(visibility)}</span>
      <button onClick={() => controls.scrollToEnd(animated)}>End</button>
      <button onClick={() => controls.scrollToStart(animated)}>Start</button>
      <button onClick={() => controls.scrollToMessage("b", false)}>
        Message b
      </button>
    </>
  );
};
const Rows = ({ shift = 0 }: { shift?: number }) => {
  const { registerItem } = useScroller("rows");
  useEffect(() => {
    registerItem("a", { anchor: true, height: 80, y: 20 + shift });
    registerItem("b", { anchor: true, height: 80, y: 200 + shift });
  }, [shift, registerItem]);
  return null;
};
const tree = (
  position: MessageScrollerPosition = "end",
  follow = false,
  shift = 0
) => (
  <PanelUIProvider reducedMotion>
    <MessageScroller autoScroll={follow} defaultScrollPosition={position}>
      <Rows shift={shift} />
      <MessageScroller.Viewport id="chat">
        <MessageScroller.Content>
          <span>Messages</span>
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <MessageScroller.Button />
      <Probe />
    </MessageScroller>
  </PanelUIProvider>
);
it.each(FIXTURES.edges)(
  "matches pinned edge frame %#",
  ({ target, contentHeight, viewportHeight, offset, distance, visible }) => {
    expect(
      distanceFromMessageScrollerTarget(
        target === "start" ? "start" : "end",
        offset,
        contentHeight,
        viewportHeight
      )
    ).toBe(distance);
    expect(isMessageScrollerTargetVisible(distance)).toBe(visible);
  }
);
it.each(FIXTURES.navigation)(
  "matches pinned navigation %#",
  ({ items, position, visible, initial, anchor, indices }) => {
    expect(
      initialMessageScrollerIndex(items, position as MessageScrollerPosition) ??
        null
    ).toBe(initial);
    expect(messageScrollerAnchorAt(items, visible)).toBe(anchor);
    expect(
      ["a", "b", "c", "missing"].map(
        (id) => messageScrollerIndex(items, id) ?? null
      )
    ).toEqual(indices);
  }
);
it("opens at end and exposes stable start/end/id commands", async () => {
  setTestMeasurement(300, 375);
  render(tree());
  setupMeasure(600);
  await settle();
  expect(readTop()).toBe(400);
  fireEvent.click(screen.getByText("Start"));
  await settle();
  expect(readTop()).toBe(0);
  fireEvent.click(screen.getByText("Message b"));
  await settle();
  expect(readTop()).toBe(176);
  fireEvent.click(screen.getByText("End"));
  await settle();
  expect(readTop()).toBe(400);
});
it("opens at the last anchor and publishes settled visibility", async () => {
  setTestMeasurement(300, 375);
  render(tree("last-anchor"));
  setupMeasure(600);
  await settle();
  expect(readTop()).toBe(176);
  issueScroll(200, 600);
  act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
  expect(
    JSON.parse(screen.getByTestId("visibility").textContent ?? "{}")
  ).toEqual({ atEnd: false, currentAnchorId: "b" });
  expect(
    screen.getByRole("button", { name: "Jump to the latest message" })
  ).toBeDefined();
});
it("follows streamed growth only at the edge and resumes after an explicit jump", async () => {
  setTestMeasurement(300, 375);
  render(tree("end", true));
  setupMeasure(600);
  await settle();
  issueScroll(400, 600);
  setupMeasure(700);
  act(() => emitTestResize());
  await settle();
  expect(readTop()).toBe(500);
  issueScroll(100, 700);
  setupMeasure(800);
  act(() => emitTestResize());
  await settle();
  expect(readTop()).toBe(500);
  fireEvent.click(screen.getByText("End"));
  await settle();
  expect(readTop()).toBe(600);
  setupMeasure(900);
  act(() => emitTestResize());
  await settle();
  expect(readTop()).toBe(700);
});
it("preserves prepends by actual row shift when a simultaneous edit changes total growth", async () => {
  setTestMeasurement(300, 375);
  const view = render(tree("start"));
  setupMeasure(600);
  await settle();
  issueScroll(100, 600);
  view.rerender(tree("start", false, 60));
  setupMeasure(700);
  act(() => emitTestResize());
  await settle();
  expect(readTop()).toBe(160);
  expect(
    topmostShift(
      new Map([
        ["a", 20],
        ["b", 200],
      ]),
      new Map([
        ["a", 80],
        ["b", 260],
      ])
    )
  ).toBe(60);
});
it("uses relative item geometry measured from the same native content frame", async () => {
  setTestMeasurement(300, 375);
  const layout = vi.fn();
  render(
    <MessageScroller defaultScrollPosition="start">
      <MessageScroller.Viewport id="chat">
        <MessageScroller.Item
          id="msg-a"
          messageId="a"
          scrollAnchor
          onLayout={layout}
        >
          Item
        </MessageScroller.Item>
      </MessageScroller.Viewport>
      <Probe />
    </MessageScroller>
  );
  setupMeasure(600);
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Missing content");
  }
  setElementMeasurement(content.id, rect(600, 45));
  setElementMeasurement("msg-a", rect(80, 145));
  await settle();
  expect(layout).toHaveBeenLastCalledWith({
    nativeEvent: { layout: { height: 80, width: 300, x: 0, y: 100 } },
  });
});
it("mounts a bounded List window and can address an offscreen stable id", async () => {
  setTestMeasurement(300, 375);
  const data = Array.from({ length: 200 }, (_, index) => ({
    messageId: String(index),
    scrollAnchor: index % 5 === 0,
  }));
  render(
    <MessageScroller defaultScrollPosition="start">
      <MessageScroller.List
        id="chat"
        data={data}
        getItemLayout={(_, index) => ({
          index,
          length: 72,
          offset: index * 84,
        })}
        renderItem={({ item }) => (
          <span data-testid="virtual-row">{item.messageId}</span>
        )}
      />
    </MessageScroller>
  );
  setupMeasure(16_868);
  await settle();
  expect(screen.getAllByTestId("virtual-row").length).toBeLessThan(40);
  issueScroll(8400, 16_868);
  await settle();
  expect(
    screen
      .getAllByTestId("virtual-row")
      .some((node) => node.textContent === "100")
  ).toBe(true);
  expect(screen.getAllByTestId("virtual-row").length).toBeLessThan(40);
  expect(transcriptWindow([0, 100, 200], [80, 80, 80], 120, 100, 1, 1)).toEqual(
    { end: 3, start: 1 }
  );
});
it("cancels settlement after unmount and rejects an orphan part", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const view = render(tree());
    setupMeasure(600);
    await settle();
    issueScroll(100, 600);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
  expect(() => render(<MessageScroller.Button />)).toThrow(
    "must be used within a <MessageScroller>"
  );
});
const virtualSample = (
  data: { messageId: string; scrollAnchor: boolean }[]
) => (
  <MessageScroller defaultScrollPosition="start">
    <MessageScroller.List
      id="chat"
      data={data}
      getItemLayout={(_, index) => ({
        index,
        length: 72,
        offset: index * 84,
      })}
      renderItem={({ item }) => <span>{item.messageId}</span>}
    />
  </MessageScroller>
);
it("preserves the virtualized reader when equal-height prepend and removal happen together", async () => {
  setTestMeasurement(300, 375);
  const initial = Array.from({ length: 50 }, (_, index) => ({
    messageId: `row-${index}`,
    scrollAnchor: index % 5 === 0,
  }));

  const view = render(virtualSample(initial));
  setupMeasure(4268);
  await settle();
  issueScroll(840, 4268);
  await settle();
  view.rerender(
    virtualSample([
      { messageId: "older-a", scrollAnchor: true },
      { messageId: "older-b", scrollAnchor: false },
      ...initial.slice(0, -2),
    ])
  );
  await settle();
  expect(readTop()).toBe(1008);
});
it("ignores a row measurement when its native content origin is unavailable", async () => {
  setTestMeasurement(300, 375);
  const layout = vi.fn();
  render(
    <MessageScroller>
      <MessageScroller.Viewport id="chat">
        <MessageScroller.Item id="msg-a" messageId="a" onLayout={layout}>
          Item
        </MessageScroller.Item>
      </MessageScroller.Viewport>
    </MessageScroller>
  );
  setupMeasure(600);
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Missing content");
  }
  setElementMeasurement(content.id, null);
  setElementMeasurement("msg-a", rect(80, 145));
  await settle();
  expect(layout).not.toHaveBeenCalled();
});

it("reports item coordinates relative to its native content box", async () => {
  setTestMeasurement(300, 375);
  const layout = vi.fn();
  render(
    <MessageScroller>
      <MessageScroller.Viewport id="chat">
        <MessageScroller.Item
          id="relative-row"
          messageId="relative"
          onLayout={layout}
        >
          Row
        </MessageScroller.Item>
      </MessageScroller.Viewport>
    </MessageScroller>
  );
  setupMeasure(600);
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Missing content");
  }
  setElementMeasurement(content.id, { ...rect(600, 100), left: 6 });
  setElementMeasurement("relative-row", { ...rect(80, 145), left: 18 });
  await settle();
  expect(layout).toHaveBeenLastCalledWith({
    nativeEvent: { layout: { height: 80, width: 300, x: 12, y: 45 } },
  });
});
it("keeps the first visible virtual row in place when earlier rows grow", async () => {
  setTestMeasurement(300, 375);
  const data = Array.from({ length: 50 }, (_, index) => ({
    messageId: `row-${index}`,
  }));
  const sample = (growth: number) => (
    <MessageScroller defaultScrollPosition="start">
      <MessageScroller.List
        id="chat"
        data={data}
        getItemLayout={(_, index) => ({
          index,
          length: index === 0 ? 72 + growth : 72,
          offset: index * 84 + (index > 0 ? growth : 0),
        })}
        renderItem={({ item }) => <span>{item.messageId}</span>}
      />
    </MessageScroller>
  );
  const view = render(sample(0));
  setupMeasure(4268);
  await settle();
  issueScroll(840, 4268);
  await settle();
  view.rerender(sample(60));
  await settle();
  expect(readTop()).toBe(900);
});

it("opens at a real asynchronously measured Item anchor", async () => {
  setTestMeasurement(300, 375);
  setElementMeasurement("chat", rect(200));
  setElementMeasurement("a", rect(80, 20));
  setElementMeasurement("b", rect(80, 200));
  const result = render(
    <PanelUIProvider reducedMotion>
      <MessageScroller defaultScrollPosition="last-anchor">
        <MessageScroller.Viewport id="chat">
          <MessageScroller.Content>
            <MessageScroller.Item id="a" messageId="a" scrollAnchor>
              A
            </MessageScroller.Item>
            <MessageScroller.Item id="b" messageId="b" scrollAnchor>
              B
            </MessageScroller.Item>
          </MessageScroller.Content>
        </MessageScroller.Viewport>
      </MessageScroller>
    </PanelUIProvider>
  );
  const content = result.container.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Content missing");
  }
  setElementMeasurement(content.id, rect(600));
  await settle();
  await settle();
  await settle();
  expect(
    Number(result.container.querySelector("#chat")?.getAttribute("scrollTop"))
  ).toBe(176);
});

it("uses resolved content padding for virtual rows and native event callbacks", async () => {
  setTestMeasurement(300, 375);
  const onTouchEnd = vi.fn();
  const onScroll = vi.fn();
  const data = Array.from({ length: 50 }, (_, index) => ({
    messageId: index === 1 ? "b" : `row-${index}`,
  }));
  render(
    <MessageScroller defaultScrollPosition="start">
      <Probe />
      <MessageScroller.List
        id="chat"
        data={data}
        contentContainerClassName="p-[0px] pb-[0px]"
        onTouchEnd={onTouchEnd}
        onScroll={onScroll}
        getItemLayout={(_, index) => ({
          index,
          length: 72,
          offset: index * 84,
        })}
        renderItem={({ item }) => <span>{item.messageId}</span>}
      />
    </MessageScroller>
  );
  setupMeasure(4188);
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Missing content");
  }
  setElementComputedStyle(content.id, {
    paddingBottom: "0px",
    paddingTop: "0px",
  });
  await settle();
  await settle();
  fireEvent.click(screen.getByText("Message b"));
  await settle();
  expect(readTop()).toBe(60);
  issueScroll(84, 4188);
  expect(onScroll).toHaveBeenCalledTimes(1);
  fireEvent.touchEnd(scroll());
  expect(onTouchEnd).toHaveBeenCalledTimes(1);
});
const FractionalRows = () => {
  const { registerItem } = useScroller("fractionalrows");
  useEffect(() => {
    registerItem("a", { anchor: true, height: 80, y: 450 });
    registerItem("b", { anchor: true, height: 80, y: 875.0400000000001 });
  }, [registerItem]);
  return null;
};
const fractionalTree = () => (
  <MessageScroller defaultScrollPosition="start">
    <FractionalRows />
    <MessageScroller.Viewport id="chat">
      <MessageScroller.Content>Fractional</MessageScroller.Content>
    </MessageScroller.Viewport>
    <Probe />
  </MessageScroller>
);
it("settled anchor tolerates native integer scrollTop rounding below its fractional target", async () => {
  setTestMeasurement(300, 375);
  render(fractionalTree());
  setupMeasure(2650);
  await settle();
  issueScroll(851, 2650);
  act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
  expect(
    JSON.parse(screen.getByTestId("visibility").textContent ?? "{}")
      .currentAnchorId
  ).toBe("b");
});
const ReorderedRows = () => {
  const { registerItem } = useScroller("reorderedrows");
  useEffect(() => {
    registerItem("b", { anchor: true, height: 80, y: 200 });
    registerItem("a", { anchor: true, height: 80, y: 20 });
  }, [registerItem]);
  return null;
};
const reorderedTree = () => (
  <MessageScroller defaultScrollPosition="last-anchor">
    <ReorderedRows />
    <MessageScroller.Viewport id="chat">
      <MessageScroller.Content>Measured out of order</MessageScroller.Content>
    </MessageScroller.Viewport>
  </MessageScroller>
);
it("last anchor follows visual position rather than asynchronous registration completion order", async () => {
  setTestMeasurement(300, 375);
  render(reorderedTree());
  setupMeasure(600);
  await settle();
  expect(readTop()).toBe(176);
});
it("retries pending item origins after native layout becomes available with unchanged row rectangles", async () => {
  setTestMeasurement(300, 375);
  setElementMeasurement("chat", rect(200));
  setElementMeasurement("a", rect(80, 20));
  setElementMeasurement("b", rect(80, 200));
  const view = render(
    <MessageScroller defaultScrollPosition="last-anchor">
      <MessageScroller.Viewport id="chat">
        <MessageScroller.Content>
          <MessageScroller.Item id="a" messageId="a" scrollAnchor>
            A
          </MessageScroller.Item>
          <MessageScroller.Item id="b" messageId="b" scrollAnchor>
            B
          </MessageScroller.Item>
        </MessageScroller.Content>
      </MessageScroller.Viewport>
    </MessageScroller>
  );
  const content = view.container.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Content missing");
  }
  setElementMeasurement(content.id, null);
  await settle();
  await settle();
  setElementMeasurement(content.id, rect(600));
  act(() => emitTestResize());
  await settle();
  await settle();
  await settle();
  expect(readTop()).toBe(176);
});
const VIRTUAL_TURN_DATA = Array.from({ length: 30 }, (_, index) => ({
  messageId: index === 10 ? "b" : `turn-${index}`,
  scrollAnchor: index % 5 === 0,
}));
const virtualTimingTree = (
  callbacks: { onTouchStart?: () => void; onDragStart?: () => void } = {}
) => (
  <MessageScroller defaultScrollPosition="last-anchor">
    <MessageScroller.List
      id="chat"
      data={VIRTUAL_TURN_DATA}
      getItemLayout={(_, index) => ({ index, length: 72, offset: index * 84 })}
      renderItem={({ item }) => <span>{item.messageId}</span>}
      {...callbacks}
    />
    <Probe />
  </MessageScroller>
);
const currentAnchor = () =>
  JSON.parse(screen.getByTestId("visibility").textContent ?? "{}")
    .currentAnchorId as string | null;
it("virtual programmatic initial scroll keeps its chosen anchor until a real user drag", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const drag = vi.fn();
    render(virtualTimingTree({ onDragStart: drag }));
    setupMeasure(2588);
    await settle();
    await settle();
    expect(currentAnchor()).toBe("turn-25");
    issueScroll(readTop(), 2588);
    act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
    act(() => vi.advanceTimersByTime(120));
    expect(currentAnchor()).toBe("turn-25");
    fireEvent.dragStart(scroll());
    expect(drag).toHaveBeenCalledOnce();
    act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.dragEnd, {}));
    expect(currentAnchor()).toBe("turn-20");
  } finally {
    vi.useRealTimers();
  }
});
it("virtual user touch recalculates visible anchors, while later button scroll retains its explicit target", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(300, 375);
    const touch = vi.fn();
    render(virtualTimingTree({ onTouchStart: touch }));
    setupMeasure(2588);
    await settle();
    await settle();
    issueScroll(readTop(), 2588);
    fireEvent.touchStart(scroll());
    expect(touch).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(120));
    expect(currentAnchor()).toBe("turn-20");
    fireEvent.click(screen.getByText("Message b"));
    await settle();
    expect(currentAnchor()).toBe("b");
    issueScroll(readTop(), 2588);
    act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
    act(() => vi.advanceTimersByTime(120));
    expect(currentAnchor()).toBe("b");
  } finally {
    vi.useRealTimers();
  }
});

it("virtual padding measurement preserves a pending message target instead of rebasing from stale native offset", async () => {
  setTestMeasurement(300, 390);
  render(virtualTimingTree());
  setupMeasure(2691.52);
  const content = document.querySelector<HTMLElement>(
    '[id^="panel-messages-content"]'
  );
  if (!content) {
    throw new Error("Content missing");
  }
  setElementFieldsResult(content.id, {});
  await settle();
  await settle();
  expect(readTop()).toBeCloseTo(((16 + 25 * 84 - 24) * 390) / 375, 8);
  expect(currentAnchor()).toBe("turn-25");
  setElementFieldsResult(content.id, {
    paddingBottom: "64px",
    paddingTop: "16px",
  });
  act(() => emitTestResize());
  await settle();
  await settle();
  await settle();
  expect(readTop()).toBeCloseTo(
    (((16 * 375) / 390 + 25 * 84 - 24) * 390) / 375,
    8
  );
  expect(currentAnchor()).toBe("turn-25");
});
const growingVirtualTree = (extra: number, growthIndex = 24) => (
  <MessageScroller defaultScrollPosition="last-anchor">
    <MessageScroller.List
      id="chat"
      data={VIRTUAL_TURN_DATA}
      getItemLayout={(_, index) => ({
        index,
        length: 72 + (index === growthIndex ? extra : 0),
        offset: index * 84 + (index > growthIndex ? extra : 0),
      })}
      renderItem={({ item }) => <span>{item.messageId}</span>}
    />
    <Probe />
  </MessageScroller>
);
it("a pending virtual message destination follows preceding row height growth by target identity", async () => {
  setTestMeasurement(300, 375);
  const view = render(growingVirtualTree(0));
  setupMeasure(2588);
  await settle();
  await settle();
  expect(readTop()).toBe(2092);
  view.rerender(growingVirtualTree(100));
  await settle();
  await settle();
  await settle();
  expect(readTop()).toBe(2192);
  expect(currentAnchor()).toBe("turn-25");
});

it("a user interruption after virtual target acknowledgement restores reader preservation", async () => {
  setTestMeasurement(300, 375);
  const view = render(growingVirtualTree(0));
  setupMeasure(2588);
  await settle();
  await settle();
  issueScroll(2092, 2588);
  fireEvent.touchStart(scroll());
  issueScroll(1000, 2588);
  view.rerender(growingVirtualTree(100, 0));
  await settle();
  await settle();
  expect(readTop()).toBe(1100);
});
it("virtual user interruption clears an unacknowledged destination before layout correction", async () => {
  setTestMeasurement(300, 375);
  const view = render(growingVirtualTree(0));
  setupMeasure(2588);
  await settle();
  await settle();
  fireEvent.touchStart(scroll());
  issueScroll(1000, 2588);
  view.rerender(growingVirtualTree(100, 0));
  await settle();
  await settle();
  expect(readTop()).toBe(1100);
});
const autoFollowVirtualTree = (count: number, animated = false) => (
  <MessageScroller autoScroll defaultScrollPosition="end">
    <MessageScroller.List
      id="chat"
      data={[
        ...VIRTUAL_TURN_DATA,
        ...Array.from({ length: Math.max(0, count - 30) }, (_, index) => ({
          messageId: `reply-${index}`,
          scrollAnchor: false,
        })),
      ]}
      getItemLayout={(_, index) => ({ index, length: 72, offset: index * 84 })}
      renderItem={({ item }) => <span>{item.messageId}</span>}
    />
    <Probe animated={animated} />
  </MessageScroller>
);
it("virtual auto-follow waits for native content extent instead of issuing an end request against the old range", async () => {
  setTestMeasurement(300, 375);
  const view = render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  issueScroll(2388, 2588);
  view.rerender(autoFollowVirtualTree(31));
  await settle();
  await settle();
  expect(readTop()).toBe(2388);
  setupMeasure(2672);
  act(() => emitTestResize());
  await settle();
  await settle();
  expect(readTop()).toBe(2472);
});
it("virtual native extent growth reissues an explicit pending end request after old-range clamping", async () => {
  setTestMeasurement(300, 375);
  const view = render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  issueScroll(2388, 2588);
  view.rerender(autoFollowVirtualTree(31));
  await settle();
  await settle();
  fireEvent.click(screen.getByText("End"));
  await settle();
  expect(readTop()).toBe(2388);
  const writes = vi.spyOn(scroll(), "setAttribute");
  setupMeasure(2672);
  act(() => emitTestResize());
  await settle();
  await settle();
  const values = writes.mock.calls
    .filter(([name]) => name.toLowerCase() === "scrolltop")
    .map(([, value]) => value);
  expect(values).toContain("2472");
  writes.mockRestore();
});
it("virtual end uses measured native extent instead of the approximate virtual ledger", async () => {
  setTestMeasurement(300, 375);
  const view = render(autoFollowVirtualTree(30));
  setupMeasure(2520);
  await settle();
  await settle();
  expect(readTop()).toBe(2320);
  issueScroll(2320, 2520);
  view.rerender(autoFollowVirtualTree(31));
  await settle();
  await settle();
  expect(readTop()).toBe(2320);
  setupMeasure(2604);
  act(() => emitTestResize());
  await settle();
  await settle();
  expect(readTop()).toBe(2404);
});
it("enhanced native scrolling reexecutes repeated destinations after an earlier command was clamped", async () => {
  NATIVE_SCROLL.enabled = true;
  setTestMeasurement(300, 375);
  render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  NATIVE_SCROLL.scrollTo.mockClear();
  fireEvent.click(screen.getByText("End"));
  await settle();
  fireEvent.click(screen.getByText("End"));
  await settle();
  expect(NATIVE_SCROLL.scrollTo.mock.calls).toEqual([
    [{ animated: false, duration: 0, top: 2388 }],
    [{ animated: false, duration: 0, top: 2388 }],
  ]);
  expect(NATIVE_SCROLL.scope).toHaveBeenCalled();
  expect(scroll().getAttribute("scrollTop")).toBeNull();
});
it("enhanced native scrolling converts logical destinations into native pixels and preserves animation intent", async () => {
  NATIVE_SCROLL.enabled = true;
  setTestMeasurement(300, 390);
  render(autoFollowVirtualTree(30, true));
  setupMeasure(2588);
  await settle();
  await settle();
  expect(NATIVE_SCROLL.scrollTo).toHaveBeenLastCalledWith({
    animated: false,
    duration: 0,
    top: 2388,
  });
  fireEvent.click(screen.getByText("Start"));
  await settle();
  expect(NATIVE_SCROLL.scrollTo).toHaveBeenLastCalledWith({
    animated: true,
    top: 0,
  });
});
it("enhanced native scrolling discards stale node callbacks when a newer move wins", async () => {
  NATIVE_SCROLL.enabled = true;
  NATIVE_SCROLL.delayed = true;
  setTestMeasurement(300, 375);
  render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  fireEvent.click(screen.getByText("Start"));
  await settle();
  expect(NATIVE_SCROLL.pending.length).toBeGreaterThanOrEqual(2);
  const latest = NATIVE_SCROLL.pending.pop();
  act(() => latest?.());
  act(() => {
    for (const deliver of NATIVE_SCROLL.pending) {
      deliver();
    }
  });
  expect(NATIVE_SCROLL.scrollTo.mock.calls).toEqual([
    [{ animated: false, duration: 0, top: 0 }],
  ]);
});
it("enhanced native scrolling cancels callbacks after unmount", async () => {
  NATIVE_SCROLL.enabled = true;
  NATIVE_SCROLL.delayed = true;
  setTestMeasurement(300, 375);
  const view = render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  expect(NATIVE_SCROLL.pending.length).toBeGreaterThan(0);
  view.unmount();
  for (const deliver of NATIVE_SCROLL.pending) {
    deliver();
  }
  expect(NATIVE_SCROLL.scrollTo).not.toHaveBeenCalled();
});
it.each(["touchstart", "dragstart"] as const)(
  "enhanced native scrolling cancels delayed destinations when a user begins %s",
  async (event) => {
    NATIVE_SCROLL.enabled = true;
    NATIVE_SCROLL.delayed = true;
    setTestMeasurement(300, 375);
    const onTouchStart = vi.fn();
    const onDragStart = vi.fn();
    render(virtualTimingTree({ onDragStart, onTouchStart }));
    setupMeasure(2588);
    await settle();
    await settle();
    expect(NATIVE_SCROLL.pending.length).toBeGreaterThan(0);
    if (event === "touchstart") {
      fireEvent.touchStart(scroll());
      expect(onTouchStart).toHaveBeenCalledOnce();
    } else {
      fireEvent.dragStart(scroll());
      expect(onDragStart).toHaveBeenCalledOnce();
    }
    for (const deliver of NATIVE_SCROLL.pending) {
      deliver();
    }
    expect(NATIVE_SCROLL.scrollTo).not.toHaveBeenCalled();
  }
);
it("unsupported node API retains the declarative scrolling fallback", async () => {
  NATIVE_SCROLL.noNodeApi = true;
  setTestMeasurement(300, 375);
  render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  expect(readTop()).toBe(2388);
  fireEvent.click(screen.getByText("Start"));
  await settle();
  expect(readTop()).toBe(0);
  expect(NATIVE_SCROLL.scrollTo).not.toHaveBeenCalled();
});
it("stale unsupported node callbacks cannot write a fallback destination over the latest native command", async () => {
  NATIVE_SCROLL.enabled = false;
  NATIVE_SCROLL.delayed = true;
  setTestMeasurement(300, 375);
  render(autoFollowVirtualTree(30));
  setupMeasure(2588);
  await settle();
  await settle();
  const stale = NATIVE_SCROLL.pending.splice(0);
  NATIVE_SCROLL.enabled = true;
  fireEvent.click(screen.getByText("Start"));
  await settle();
  act(() => {
    for (const deliver of NATIVE_SCROLL.pending) {
      deliver();
    }
  });
  NATIVE_SCROLL.enabled = false;
  act(() => {
    for (const deliver of stale) {
      deliver();
    }
  });
  await settle();
  expect(NATIVE_SCROLL.scrollTo).toHaveBeenCalledOnce();
  expect(scroll().getAttribute("scrollTop")).toBeNull();
});

const contentGrowthVisibilityTree = (count: number, following: boolean) => (
  <MessageScroller autoScroll={following} defaultScrollPosition="end">
    <Rows />
    <MessageScroller.Viewport id="chat">
      <MessageScroller.Content>
        {Array.from({ length: count }, (_, index) => (
          <span key={index}>Reply {index}</span>
        ))}
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button />
    <Probe />
  </MessageScroller>
);
it("plain content growth refreshes end visibility without a native scroll event when following is disabled", async () => {
  setTestMeasurement(300, 375);
  const view = render(contentGrowthVisibilityTree(30, true));
  setupMeasure(600);
  await settle();
  issueScroll(400, 600);
  expect(
    JSON.parse(screen.getByTestId("visibility").textContent ?? "{}").atEnd
  ).toBe(true);
  view.rerender(contentGrowthVisibilityTree(30, false));
  await settle();
  view.rerender(contentGrowthVisibilityTree(31, false));
  setupMeasure(684);
  act(() => emitTestResize());
  await settle();
  await settle();
  expect(readTop()).toBe(400);
  expect(
    JSON.parse(screen.getByTestId("visibility").textContent ?? "{}").atEnd
  ).toBe(false);
  await waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Jump to the latest message" })
        .getAttribute("aria-disabled")
    ).toBe("false")
  );
});
const pendingEndVirtualTree = (count: number, following: boolean) => (
  <MessageScroller autoScroll={following} defaultScrollPosition="end">
    <MessageScroller.List
      id="chat"
      data={Array.from({ length: count }, (_, index) => ({
        messageId: `reply-${index}`,
        scrollAnchor: index % 5 === 0,
      }))}
      getItemLayout={(_, index) => ({ index, length: 72, offset: index * 84 })}
      renderItem={({ item }) => <span>{item.messageId}</span>}
    />
    <Probe />
  </MessageScroller>
);
it("disabling follow cancels an unacknowledged virtual end intent before later native content growth", async () => {
  setTestMeasurement(300, 375);
  const view = render(pendingEndVirtualTree(30, true));
  setupMeasure(2520);
  await settle();
  await settle();
  issueScroll(2320, 2520);
  fireEvent.click(screen.getByText("End"));
  await settle();
  expect(readTop()).toBe(2320);
  view.rerender(pendingEndVirtualTree(30, false));
  await settle();
  view.rerender(pendingEndVirtualTree(31, false));
  setupMeasure(2604);
  act(() => emitTestResize());
  await settle();
  await settle();
  expect(readTop()).toBe(2320);
  expect(
    JSON.parse(screen.getByTestId("visibility").textContent ?? "{}").atEnd
  ).toBe(false);
});

it("settles the recorded 390px initial native event sequence without a scroll-end event", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(356, 390);
    const view = render(
      <PanelUIProvider reducedMotion>
        <MessageScroller defaultScrollPosition="last-anchor">
          <MessageScroller.Viewport id="chat">
            <MessageScroller.Content>
              {Array.from({ length: 30 }, (_, index) => (
                <MessageScroller.Item
                  key={index}
                  id={`recorded-row-${index}`}
                  messageId={`message-${index}`}
                  scrollAnchor={index % 5 === 0}
                >
                  <span>message-{index}</span>
                </MessageScroller.Item>
              ))}
            </MessageScroller.Content>
          </MessageScroller.Viewport>
          <Probe />
        </MessageScroller>
      </PanelUIProvider>
    );
    const content = document.querySelector<HTMLElement>(
      '[id^="panel-messages-content"]'
    );
    if (!content) {
      throw new Error("Missing recorded transcript content");
    }
    const origin = 305.171875;
    setElementMeasurement("chat", {
      height: 353.015625,
      left: 17,
      top: origin,
      width: 356,
    });
    setElementMeasurement(content.id, {
      height: 2650,
      left: 17,
      top: origin,
      width: 356,
    });
    for (let index = 0; index < 30; index += 1) {
      setElementMeasurement(`recorded-row-${index}`, {
        height: 74,
        left: 33,
        top: origin + 16 + index * 86,
        width: 324,
      });
    }
    act(() => emitTestResize());
    await settle();
    await settle();
    const events = [
      [0, 2],
      [15, 21],
      [63, 57],
      [68, 88],
      [118, 155],
      [131, 247],
      [184, 363],
      [200, 493],
      [251, 646],
      [265, 806],
      [316, 983],
      [330, 1153],
      [384, 1331],
      [396, 1486],
      [452, 1645],
      [466, 1775],
      [515, 1891],
      [530, 1978],
      [583, 2054],
      [599, 2103],
      [651, 2130],
      [662, 2141],
    ] as const;
    let lastTime = 0;
    for (const [time, offset] of events) {
      const delay = time - lastTime;
      act(() => vi.advanceTimersByTime(delay));
      issueScroll(offset, 2650);
      lastTime = time;
    }
    act(() => vi.advanceTimersByTime(121));
    await settle();
    expect(currentAnchor()).toBe("message-25");
    setElementMeasurement(content.id, {
      height: 2650,
      left: 17,
      top: origin - 2141,
      width: 356,
    });
    for (let index = 0; index < 30; index += 1) {
      setElementMeasurement(`recorded-row-${index}`, {
        height: 74,
        left: 33,
        top: origin + 16 + index * 86 - 2141,
        width: 324,
      });
    }
    act(() => emitTestResize());
    await settle();
    await settle();
    expect(currentAnchor()).toBe("message-25");
    view.unmount();
  } finally {
    vi.useRealTimers();
  }
});

const NativeFinalRows = () => {
  const { registerItem } = useScroller("native-final-rows");
  useEffect(() => {
    registerItem("message-20", {
      anchor: true,
      height: 74 / 1.04,
      y: 1736 / 1.04,
    });
    registerItem("message-25", {
      anchor: true,
      height: 74 / 1.04,
      y: 2166 / 1.04,
    });
  }, [registerItem]);
  return null;
};
const nativeFinalTree = (id = "chat") => (
  <MessageScroller defaultScrollPosition="start">
    <NativeFinalRows />
    <MessageScroller.Viewport id={id}>
      <MessageScroller.Content>
        Recorded native final pixel
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <Probe />
  </MessageScroller>
);
it("reads native final offset when the last animated scroll event omits two pixels", async () => {
  vi.useFakeTimers();
  try {
    setTestMeasurement(356, 390);
    render(nativeFinalTree());
    setupMeasure(2650);
    await settle();
    NATIVE_OFFSET.enabled = true;
    NATIVE_OFFSET.top = 2141;
    issueScroll(2139, 2650);
    act(() => vi.advanceTimersByTime(121));
    await settle();
    expect(currentAnchor()).toBe("message-25");
  } finally {
    vi.useRealTimers();
  }
});
it.each(["scroll", "touch", "command", "driver", "unmount"] as const)(
  "rejects a delayed native settlement after a newer %s",
  async (interruption) => {
    vi.useFakeTimers();
    try {
      setTestMeasurement(356, 390);
      const view = render(nativeFinalTree());
      setupMeasure(2650);
      await settle();
      issueScroll(2139, 2650);
      act(() => vi.advanceTimersByTime(121));
      await settle();
      expect(currentAnchor()).toBe("message-20");
      NATIVE_OFFSET.enabled = true;
      NATIVE_OFFSET.delayed = true;
      act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
      await settle();
      expect(NATIVE_OFFSET.pending.length).toBeGreaterThan(0);
      const deliver = NATIVE_OFFSET.pending.shift();
      if (!deliver) {
        throw new Error("Missing delayed native offset response");
      }
      if (interruption === "scroll") {
        issueScroll(1800, 2650);
      }
      if (interruption === "touch") {
        fireEvent.touchStart(scroll());
      }
      if (interruption === "command") {
        fireEvent.click(screen.getByText("Start"));
      }
      if (interruption === "driver") {
        view.rerender(nativeFinalTree("chat-next"));
      }
      if (interruption === "unmount") {
        view.unmount();
      }
      act(deliver);
      await settle();
      if (interruption === "unmount") {
        expect(screen.queryByTestId("visibility")).toBeNull();
      } else {
        expect(currentAnchor()).toBe("message-20");
      }
    } finally {
      vi.useRealTimers();
    }
  }
);
it("falls back to the current event offset when native scrollOffset returns no node", async () => {
  setTestMeasurement(356, 390);
  render(nativeFinalTree());
  setupMeasure(2650);
  await settle();
  NATIVE_OFFSET.enabled = true;
  NATIVE_OFFSET.top = null;
  issueScroll(2139, 2650);
  act(() => dispatchTaroEvent(scroll(), TARO_TEST_EVENTS.scrollEnd, {}));
  await settle();
  expect(currentAnchor()).toBe("message-20");
});
