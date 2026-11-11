import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
// @vitest-environment happy-dom
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { SankeyChart, useSankeyChart } from "../src/components/SankeyChart";
import type { SankeyChartProps } from "../src/components/SankeyChart";
import { useChart } from "../src/components/SankeyChart/context";
import { ribbonFrame, barFrame } from "../src/components/SankeyChart/graphics";
import { labelPlacements } from "../src/components/SankeyChart/math";
import { sankeyLayout } from "../src/components/SankeyChart/sankey-layout";
import type { SankeyAlign } from "../src/components/SankeyChart/sankey-layout";
import { DirectionContext } from "../src/hooks/use-direction";
import FIXTURES from "./fixtures/sankey-chart-source.json";
import { setTestMeasurement } from "./taro-api";

it.each(FIXTURES.layouts)(
  "matches source dropped rows/cycles/dupes/columns/relaxation/collapse %#",
  ({ nodes, links, options, expected }) => {
    expect(
      sankeyLayout(nodes, links, {
        ...options,
        align: options.align as SankeyAlign,
      })
    ).toEqual(expected);
  }
);
it.each(FIXTURES.labels)(
  "matches source bounded nonoverlapping upright/vertical names %#",
  ({ layout, width, height, upright, showValue, expected }) => {
    expect(
      labelPlacements(layout, width, height, upright, 6, showValue, (id) => id)
    ).toEqual(expected);
  }
);

const NODES = [
  { id: "A", label: "Source" },
  { id: "B", label: "Middle" },
  { id: "C", label: "Side" },
  { id: "D", label: "Destination" },
];
const LINKS = [
  { source: "A", target: "B", value: 80 },
  { source: "A", target: "C", value: 20 },
  { source: "B", target: "D", value: 70 },
  { source: "C", target: "D", value: 20 },
];
const Probe = () => {
  const state = useSankeyChart();
  const { layout, width, height } = useChart("probe");
  return (
    <span data-testid="sankey-state">
      {JSON.stringify({ ...state, height, layout, width })}
    </span>
  );
};
Probe.slot = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("sankey-state").textContent ?? "{}");
const model = (
  props: Partial<SankeyChartProps> = {},
  rtl = false,
  minHeight = 6
) => (
  <PanelUIProvider reducedMotion>
    <DirectionContext.Provider value={rtl ? "rtl" : "ltr"}>
      <SankeyChart nodes={NODES} links={LINKS} {...props}>
        <SankeyChart.Header title="Traffic" value="100" />
        <SankeyChart.Links />
        <SankeyChart.Nodes />
        <SankeyChart.Labels minHeight={minHeight} />
        <SankeyChart.Tooltip />
        <SankeyChart.Skeleton />
        <SankeyChart.Legend />
        <SankeyChart.Breakdown />
        <Probe />
      </SankeyChart>
    </DirectionContext.Provider>
  </PanelUIProvider>
);
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const svg = () =>
  decodeURIComponent(
    document
      .querySelector('img[src^="data:image/svg+xml"]')
      ?.getAttribute("src")
      ?.split(",")[1] ?? ""
  );
it.each(FIXTURES.frames)(
  "matches source centered ribbon/bar grow, orientation and selection frame %#",
  ({ input, expected }) => {
    expect(ribbonFrame(input)).toEqual(expected.ribbon);
    expect(barFrame(input)).toEqual(expected.bar);
  }
);
it("reports invalid rows and draws shared scale geometry with one semantic entry per ribbon", async () => {
  setTestMeasurement(300, 375);
  const drop = vi.fn();
  render(
    model({
      links: [
        ...LINKS,
        { source: "D", target: "A", value: 2 },
        { source: "missing", target: "A", value: 2 },
      ],
      onDropLinks: drop,
    })
  );
  await settle();
  expect(drop).toHaveBeenLastCalledWith(2);
  expect(probe().layout.columns).toBe(3);
  expect(probe().height).toBe(240);
  expect(screen.getByLabelText("Source to Middle, 80")).toBeTruthy();
  expect(svg()).toContain('fill-opacity="0.4"');
});
it("reads incoming/outgoing on one node scale and walks the source breakdown", async () => {
  setTestMeasurement(300, 375);
  render(model({ activeId: undefined }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Middle, 80 percent" }));
  await settle();
  expect(probe().incoming).toBe(80);
  expect(probe().outgoing).toBe(70);
  expect(probe().activeValue).toBe(80);
  expect(probe().targets[0].share).toBe(0.875);
  expect(screen.getByText("In 80 · Out 70")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Destination, 70, 88 percent" })
  );
  await settle();
  expect(probe().activeId).toBe("D");
});
it("transposes stages vertically, derives104pt per stage height and mirrors horizontal RTL only", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(model({}, true));
  await settle();
  expect(probe().layout.nodes[0].x0).toBe(290);
  rerender(model({ orientation: "vertical" }, true));
  await settle();
  expect(probe().height).toBe(312);
  expect(probe().layout.nodes[0].y0).toBe(0);
  expect(probe().layout.nodes.at(-1).y1).toBe(312);
});
it("keeps missing labels in semantic node list and expands tiny bar native targets", async () => {
  setTestMeasurement(300, 375);
  const nodes = [{ id: "A" }, { id: "Big" }, { id: "Tiny" }];
  const links = [
    { source: "A", target: "Big", value: 99 },
    { source: "A", target: "Tiny", value: 1 },
  ];
  render(model({ links, nodes }, false, 500));
  await settle();
  expect(screen.getByLabelText("Node, Tiny. Value, 1")).toBeTruthy();
  const tiny = probe().layout.nodes.at(2);
  const canvas = document.querySelector(".panel-sankey-pointer") as Element;
  const y = (tiny.y0 + tiny.y1) / 2 - 12;
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 282, y }] });
  fireEvent.touchEnd(canvas, { touches: [] });
  await settle();
  expect(probe().activeId).toBe("Tiny");
});
it("collapsed bucket keeps full lossless tail routing and is selectable by its own datum", async () => {
  setTestMeasurement(300, 375);
  const nodes = [
    { id: "A" },
    ...Array.from({ length: 8 }, (_, i) => ({ id: `Target ${i}` })),
  ];
  const links = nodes
    .slice(1)
    .map((node, i) => ({ source: "A", target: node.id, value: 50 / (i + 1) }));
  render(
    model({ collapse: { label: "Others", maxPerColumn: 3 }, links, nodes })
  );
  await settle();
  const bucket = probe().layout.nodes.find(
    (node: { collapsed?: string[] }) => node.collapsed
  );
  expect(bucket.collapsed.length).toBe(6);
  const legend = screen
    .getAllByRole("button")
    .find(
      (button) =>
        button.getAttribute("aria-label")?.startsWith("Others,") &&
        button.getAttribute("aria-label")?.endsWith("percent")
    );
  expect(legend).toBeTruthy();
  fireEvent.click(legend as HTMLElement);
  await settle();
  expect(probe().activeNode).toEqual({ id: "Others" });
  expect(probe().collapsed).toHaveLength(6);
  expect(probe().incoming).toBeCloseTo(bucket.value);
});
it("preserves controlled node selection and explicit source link color", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const { rerender } = render(
    model({
      activeId: "A",
      links: [{ ...LINKS[0], color: "#abcdef" }, ...LINKS.slice(1)],
      onActiveIdChange: change,
    })
  );
  await settle();
  expect(svg()).toContain('fill="#abcdef"');
  fireEvent.click(screen.getByRole("button", { name: "Middle, 80 percent" }));
  await settle();
  expect(probe().activeId).toBe("A");
  expect(change).toHaveBeenCalledWith("B");
  rerender(model({ activeId: "B", onActiveIdChange: change }));
  await settle();
  expect(probe().activeId).toBe("B");
});
it("loading placeholder follows flow orientation and settles into ready geometry", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(
    model({ orientation: "vertical", status: "loading" })
  );
  await settle();
  expect(document.querySelector(".panel-sankey-pointer")).toBeNull();
  expect(svg()).toContain('fill-opacity="0.5"');
  rerender(model({ orientation: "vertical" }));
  await settle();
  expect(svg()).not.toContain('fill-opacity="0.5"');
  expect(document.querySelector(".panel-sankey-pointer")).toBeTruthy();
});
it("cancels native target when loading destroys and recreates the canvas", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(model());
  await settle();
  const canvas = document.querySelector(".panel-sankey-pointer") as Element;
  fireEvent.touchStart(canvas, { touches: [{ identifier: 1, x: 5, y: 120 }] });
  rerender(model({ status: "loading" }));
  await settle();
  rerender(model());
  await settle();
  fireEvent.touchEnd(
    document.querySelector(".panel-sankey-pointer") as Element,
    { touches: [] }
  );
  await settle();
  expect(probe().activeId).toBeNull();
});
