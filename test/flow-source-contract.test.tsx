// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useSyncExternalStore } from "react";
import { expect, it, vi } from "vitest";

import { Flow } from "../src/components/Flow";
import { useFlow } from "../src/components/Flow/context";
import { moveNodePosition } from "../src/components/Flow/flow-accessibility";
import {
  encodeFlowHandleKey,
  decodeFlowHandleKey,
} from "../src/components/Flow/flow-identifiers";
import {
  edgePath,
  arrivalDirection,
  anchorOf,
} from "../src/components/Flow/flow-paths";
import type { FlowSide } from "../src/components/Flow/flow-paths";
import type { FlowEdgeVariant } from "../src/components/Flow/types";
import { collectNodeIds } from "../src/components/Flow/utils";
import { PanelUIProvider } from "../src/components/Provider";
import fixtures from "./fixtures/flow-source.json";
import { setTestMeasurement } from "./taro-api";

const State = () => {
  const flow = useFlow("Flow");
  const rects = useSyncExternalStore(
    flow.rects.subscribe,
    flow.rects.getSnapshot,
    flow.rects.getSnapshot
  );
  const connection = useSyncExternalStore(
    flow.connection.subscribe,
    flow.connection.getSnapshot,
    flow.connection.getSnapshot
  );
  const x = useSyncExternalStore(
    flow.translateX.subscribe,
    flow.translateX.getSnapshot,
    flow.translateX.getSnapshot
  );
  const y = useSyncExternalStore(
    flow.translateY.subscribe,
    flow.translateY.getSnapshot,
    flow.translateY.getSnapshot
  );
  const zoom = useSyncExternalStore(
    flow.zoom.subscribe,
    flow.zoom.getSnapshot,
    flow.zoom.getSnapshot
  );
  return (
    <span data-testid="state">
      {JSON.stringify({ connection, groups: flow.groupIds, rects, x, y, zoom })}
    </span>
  );
};
const state = () => JSON.parse(screen.getByTestId("state").textContent ?? "{}");
const point = (x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
it("groups register as outlines while ordinary nodes remain filled", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Flow>
        <Flow.Group
          id="g"
          position={{ x: 0, y: 0 }}
          size={{ height: 100, width: 200 }}
        >
          <Flow.Node id="n" position={{ x: 40, y: 30 }}>
            Child
          </Flow.Node>
        </Flow.Group>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  expect(state().groups).toEqual(["g"]);
});
it("group node collection includes nested fragments", () => {
  expect(
    collectNodeIds(
      <>
        <Flow.Node id="first" position={{ x: 0, y: 0 }} />
        <>
          <Flow.Node id="second" position={{ x: 0, y: 0 }} />
        </>
      </>
    )
  ).toEqual(["first", "second"]);
});
const sample = (id: string) => (
  <PanelUIProvider reducedMotion>
    <Flow>
      <Flow.Node id={id} position={{ x: 48, y: 64 }} />
      <State />
    </Flow>
  </PanelUIProvider>
);
it("reusing a node with a new semantic id retains its provided position", () => {
  const result = render(sample("old"));
  result.rerender(sample("new"));
  expect(state().rects.new).toMatchObject({ x: 48, y: 64 });
  expect(state().rects.old).toBeUndefined();
});
it("a handle tap clears a connection draft without emitting a connection", () => {
  const connect = vi.fn();
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow onConnect={connect}>
        <Flow.Node id="node" position={{ x: 40, y: 20 }}>
          <Flow.Handle />
        </Flow.Node>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const handle =
    result.container.querySelector<HTMLElement>("[data-flow-handle]");
  if (!handle) {
    throw new Error("Handle missing");
  }
  fireEvent.touchStart(handle, { touches: [point(40, 20)] });
  fireEvent.touchEnd(handle, { touches: [] });
  expect(state().connection.active).toBe(0);
  expect(connect).not.toHaveBeenCalled();
});
it("native node drag uses zoom compensated coordinates and reports once", () => {
  setTestMeasurement(375, 375);
  const drag = vi.fn();
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow defaultViewport={{ x: 0, y: 0, zoom: 2 }} onNodeDragEnd={drag}>
        <Flow.Node id="n" position={{ x: 10, y: 20 }}>
          Node
        </Flow.Node>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const node = result.container.querySelector<HTMLElement>("[data-flow-node]");
  if (!node) {
    throw new Error("Node missing");
  }
  fireEvent.touchStart(node, { touches: [point(20, 40)] });
  fireEvent.touchMove(node, { touches: [point(60, 80)] });
  fireEvent.touchEnd(node, { touches: [] });
  expect(state().rects.n).toMatchObject({ x: 30, y: 40 });
  expect(drag).toHaveBeenCalledExactlyOnceWith("n", { x: 30, y: 40 });
});
for (const [index, fixture] of fixtures.edges.entries()) {
  it(`pinned routing and arrival ${index}`, () => {
    const [variant, from, fromSide, to, toSide, curvature, radius, gap] =
      fixture.args as [
        FlowEdgeVariant,
        { x: number; y: number },
        FlowSide,
        { x: number; y: number },
        FlowSide,
        number,
        number,
        number,
      ];
    expect(
      edgePath(variant, from, fromSide, to, toSide, curvature, radius, gap)
    ).toBe(fixture.result);
    const arrival = arrivalDirection(variant, from, to, toSide);
    expect(arrival.x).toBeCloseTo(fixture.arrival.x, 14);
    expect(arrival.y).toBeCloseTo(fixture.arrival.y, 14);
  });
}
for (const [index, fixture] of fixtures.anchors.entries()) {
  it(`pinned handle anchor ${index}`, () => {
    const [rect, side, offset] = fixture.args as [
      { x: number; y: number; width: number; height: number },
      FlowSide,
      number,
    ];
    expect(anchorOf(rect, side, offset)).toEqual(fixture.result);
  });
}
for (const [index, fixture] of fixtures.moves.entries()) {
  it(`pinned accessibility move ${index}`, () => {
    const [rect, bounds, action, step] = fixture.args as [
      { x: number; y: number; width: number; height: number },
      { x: number; y: number; width: number; height: number } | null,
      string,
      number,
    ];
    expect(
      moveNodePosition(rect, bounds ?? undefined, action, step) ?? null
    ).toEqual(fixture.result);
  });
}
for (const fixture of fixtures.keys) {
  it(`pinned opaque key ${fixture.node} ${fixture.handle}`, () => {
    expect(encodeFlowHandleKey(fixture.node, fixture.handle)).toBe(
      fixture.encoded
    );
    expect(decodeFlowHandleKey(fixture.encoded)).toEqual(fixture.decoded);
  });
}
it("background pan and pinch remain bounded, focal and report on completion", () => {
  setTestMeasurement(375, 375);
  const change = vi.fn();
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow id="canvas" maxZoom={2} onViewportChange={change}>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const canvas = result.container.querySelector<HTMLElement>("#canvas");
  if (!canvas) {
    throw new Error("Canvas missing");
  }
  fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
  fireEvent.touchMove(canvas, { touches: [point(50, 60)] });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(state()).toMatchObject({ x: 40, y: 40, zoom: 1 });
  expect(change).toHaveBeenCalledExactlyOnceWith({ x: 40, y: 40, zoom: 1 });
  const second = (x: number, y: number) => ({ ...point(x, y), identifier: 2 });
  fireEvent.touchStart(canvas, { touches: [point(0, 0), second(100, 0)] });
  fireEvent.touchMove(canvas, { touches: [point(-100, 0), second(200, 0)] });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(state()).toMatchObject({ x: 30, y: 80, zoom: 2 });
  expect(change).toHaveBeenCalledTimes(2);
});
it("group dragging includes fragment children while confined nodes clamp to parent bounds", () => {
  setTestMeasurement(375, 375);
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow>
        <Flow.Group
          id="g"
          position={{ x: 0, y: 0 }}
          size={{ height: 100, width: 100 }}
        >
          <>
            <Flow.Node id="n" confine position={{ x: 10, y: 10 }}>
              Child
            </Flow.Node>
          </>
        </Flow.Group>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const group =
    result.container.querySelector<HTMLElement>("[data-flow-group]");
  const node = result.container.querySelector<HTMLElement>("[data-flow-node]");
  if (!group || !node) {
    throw new Error("Graph missing");
  }
  fireEvent.touchStart(group, { touches: [point(0, 0)] });
  fireEvent.touchMove(group, { touches: [point(20, 30)] });
  fireEvent.touchEnd(group, { touches: [] });
  expect(state().rects.g).toMatchObject({ x: 20, y: 30 });
  expect(state().rects.n).toMatchObject({ x: 30, y: 40 });
  fireEvent.touchStart(node, { touches: [point(30, 40)] });
  fireEvent.touchMove(node, { touches: [point(-100, -100)] });
  fireEvent.touchEnd(node, { touches: [] });
  expect(state().rects.n).toMatchObject({ x: 20, y: 30 });
});
it("handle release connects to the nearest eligible target and validator can reject", async () => {
  setTestMeasurement(20, 375);
  const connect = vi.fn();
  const connectionSample = (valid: boolean) => (
    <PanelUIProvider reducedMotion>
      <Flow onConnect={connect} isValidConnection={() => valid}>
        <Flow.Node id="source" position={{ x: 0, y: 0 }}>
          <Flow.Handle id="out" position="right" type="source" />
        </Flow.Node>
        <Flow.Node id="target" position={{ x: 100, y: 0 }}>
          <Flow.Handle id="in" position="left" type="target" />
        </Flow.Node>
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const result = render(connectionSample(false));
  await act(async () => {
    await Promise.resolve();
  });
  const handle =
    result.container.querySelector<HTMLElement>("[data-flow-handle]");
  if (!handle) {
    throw new Error("Handle missing");
  }
  const drag = () => {
    fireEvent.touchStart(handle, { touches: [point(0, 0)] });
    fireEvent.touchMove(handle, { touches: [point(80, 0)] });
    fireEvent.touchEnd(handle, { touches: [] });
  };
  drag();
  expect(connect).not.toHaveBeenCalled();
  result.rerender(connectionSample(true));
  drag();
  expect(connect).toHaveBeenCalledExactlyOnceWith({
    source: "source",
    sourceHandle: "out",
    target: "target",
    targetHandle: "in",
  });
  expect(state().connection.active).toBe(0);
});
const sampleHandle = (visible: boolean) => (
  <PanelUIProvider reducedMotion>
    <Flow>
      <Flow.Node id="n" position={{ x: 30, y: 20 }}>
        {visible ? <Flow.Handle /> : null}
      </Flow.Node>
      <State />
    </Flow>
  </PanelUIProvider>
);
it("unmounting an active source handle clears its transient draft", () => {
  const result = render(sampleHandle(true));
  const handle =
    result.container.querySelector<HTMLElement>("[data-flow-handle]");
  if (!handle) {
    throw new Error("Handle missing");
  }
  fireEvent.touchStart(handle, { touches: [point(0, 0)] });
  expect(state().connection.active).toBe(1);
  result.rerender(sampleHandle(false));
  expect(state().connection.active).toBe(0);
});
it("a tap-only pinned node rejects a large pointer displacement", () => {
  setTestMeasurement(375, 375);
  const press = vi.fn();
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow>
        <Flow.Node
          id="pinned"
          pinned
          position={{ x: 20, y: 30 }}
          onPress={press}
        />
        <State />
      </Flow>
    </PanelUIProvider>
  );
  const node = result.container.querySelector<HTMLElement>("[data-flow-node]");
  if (!node) {
    throw new Error("Node missing");
  }
  fireEvent.touchStart(node, { touches: [point(20, 30)] });
  fireEvent.touchMove(node, { touches: [point(100, 110)] });
  fireEvent.touchEnd(node, { touches: [] });
  expect(press).not.toHaveBeenCalled();
  expect(state().rects.pinned).toMatchObject({ x: 20, y: 30 });
  fireEvent.touchStart(node, { touches: [point(20, 30)] });
  fireEvent.touchEnd(node, { touches: [] });
  expect(press).toHaveBeenCalledOnce();
});
const settleFlowGraphics = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
it("serializes measured minimap nodes without optional SVG strokes", async () => {
  setTestMeasurement(120, 375);
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow>
        <Flow.Group
          id="group"
          position={{ x: 0, y: 0 }}
          size={{ height: 140, width: 200 }}
        >
          <Flow.Node id="node" position={{ x: 20, y: 30 }}>
            Node
          </Flow.Node>
        </Flow.Group>
        <Flow.MiniMap />
      </Flow>
    </PanelUIProvider>
  );
  await settleFlowGraphics();
  const svg = [...result.container.querySelectorAll("img")]
    .map((node) => decodeURIComponent(node.getAttribute("src") ?? ""))
    .find((source) => source.includes('data-flow-minimap-node="node"'));
  expect(svg).toBeDefined();
  const nodeRect = svg?.match(
    /<rect[^>]*data-flow-minimap-node="node"[^>]*>/u
  )?.[0];
  const groupRect = svg?.match(
    /<rect[^>]*data-flow-minimap-node="group"[^>]*>/u
  )?.[0];
  expect(nodeRect).not.toContain("stroke=");
  expect(nodeRect).not.toContain("stroke-width=");
  expect(groupRect).toContain('stroke-width="1"');
});
it("serializes a measured plain edge without an undefined dash pattern", async () => {
  setTestMeasurement(120, 375);
  const result = render(
    <PanelUIProvider reducedMotion>
      <Flow>
        <Flow.Node id="a" position={{ x: 0, y: 0 }}>
          A
        </Flow.Node>
        <Flow.Node id="b" position={{ x: 200, y: 100 }}>
          B
        </Flow.Node>
        <Flow.Edge from="a" to="b" />
      </Flow>
    </PanelUIProvider>
  );
  await settleFlowGraphics();
  const svg = [...result.container.querySelectorAll("img")]
    .map((node) => decodeURIComponent(node.getAttribute("src") ?? ""))
    .find((source) => source.includes('stroke-linecap="round"'));
  expect(svg).toContain("<path");
  expect(svg).not.toContain("stroke-dasharray=");
});
