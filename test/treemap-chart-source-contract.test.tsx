// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import {
  TreemapChart,
  useTreemapChart,
  squarifyLayout,
} from "../src/components/TreemapChart";
import type { TreemapChartProps } from "../src/components/TreemapChart";
import {
  treemapParts,
  treemapTiles,
} from "../src/components/TreemapChart/math";
import { tileFrame } from "../src/components/TreemapChart/tiles";
import FIXTURES from "./fixtures/treemap-chart-source.json";
import { setTestMeasurement } from "./taro-api";

const DATA = [
  { label: "Hosting", value: 120 },
  { label: "Tools", value: 70 },
  { label: "Travel", value: 40 },
  { label: "Supplies", value: 25 },
  { label: "Other", value: 12 },
];
const Probe = () => (
  <span data-testid="treemap-state">{JSON.stringify(useTreemapChart())}</span>
);
Probe.slot = "header" as const;
const probe = () =>
  JSON.parse(screen.getByTestId("treemap-state").textContent ?? "{}");
const model = (props: Partial<TreemapChartProps> = {}) => (
  <PanelUIProvider reducedMotion>
    <TreemapChart data={DATA} {...props}>
      <TreemapChart.Header title="Spend" value="267" />
      <TreemapChart.Tiles />
      <TreemapChart.Labels showShare />
      <TreemapChart.Tooltip />
      <TreemapChart.Skeleton />
      <TreemapChart.Legend />
      <Probe />
    </TreemapChart>
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
it.each(FIXTURES.layouts)(
  "matches actual squarify golden-ratio rectangles incl zero values %#",
  ({ values, width, height, expected }) => {
    expect(squarifyLayout(values, width, height)).toEqual(expected);
  }
);
it.each(FIXTURES.models)(
  "matches source sort/tail gather/gap/color ramp %#",
  ({ data, sort, maxTiles, gap, size, expected }) => {
    const parts = treemapParts(data, sort, maxTiles, "Others");
    expect(parts).toEqual(expected.parts);
    const total = parts.reduce((sum, part) => sum + part.value, 0);
    expect(total).toBe(expected.total);
    expect(
      treemapTiles(parts, size.width, size.height, gap, total, "#262626")
    ).toEqual(expected.tiles);
  }
);
it.each(FIXTURES.frames)(
  "matches source per-tile entrance and selection fade frame %#",
  ({ tile, window, progress, dim, expected }) => {
    expect(tileFrame(tile, window, progress, dim, 0.35)).toEqual(expected);
  }
);
it("measures tile box independently, renders coherent labels and hue rank ramp", async () => {
  setTestMeasurement(300, 375);
  render(model());
  await settle();
  expect(probe().total).toBe(267);
  expect(probe().tiles[0].sourceIndex).toBe(0);
  expect(probe().tiles[0].strength).toBe(1);
  expect(probe().tiles[4].strength).toBe(0.55);
  expect(svg()).toContain('viewBox="0 0 300 214"');
  expect(
    screen.getByRole("button", { name: "Hosting, 120, 45 percent" })
  ).toBeTruthy();
});
it("toggles source sorted tile labels and legend with full selected readout", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(model({ onActiveIndexChange: change }));
  await settle();
  fireEvent.click(
    screen.getByRole("button", { name: "Tools, 70, 26 percent" })
  );
  await settle();
  expect(probe().activeIndex).toBe(1);
  expect(screen.getByText("70 · 26%")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Tools, 26 percent" }));
  await settle();
  expect(probe().activeIndex).toBe(-1);
  expect(change.mock.calls.map(([index]) => index)).toEqual([1, -1]);
});
it("native Canvas reaches tiny unlabeled tiles and preserves scroll cancellation", async () => {
  setTestMeasurement(300, 375);
  render(model({ minLabelSize: 500 }));
  await settle();
  const tile = probe().tiles.at(4);
  const canvas = document.querySelector(".panel-treemap-pointer") as Element;
  const touch = {
    identifier: 1,
    x: tile.x + tile.width / 2,
    y: tile.y + tile.height / 2,
  };
  fireEvent.touchStart(canvas, { touches: [touch] });
  fireEvent.touchEnd(canvas, { touches: [] });
  await settle();
  expect(probe().activeIndex).toBe(4);
  fireEvent.touchStart(canvas, { touches: [touch] });
  fireEvent.touchMove(canvas, { touches: [{ ...touch, y: touch.y + 30 }] });
  fireEvent.touchEnd(canvas, { touches: [] });
  await settle();
  expect(probe().activeIndex).toBe(4);
});
it("gathers whole tail share and keeps explicit color at full strength", async () => {
  setTestMeasurement(300, 375);
  render(
    model({
      data: [
        { label: "Small", value: 10 },
        { color: "#abcdef", label: "Big", value: 80 },
        { label: "Tail", value: 10 },
      ],
      maxTiles: 2,
    })
  );
  await settle();
  expect(
    probe().tiles.map((tile: { label: string; share: number }) => [
      tile.label,
      tile.share,
    ])
  ).toEqual([
    ["Big", 0.8],
    ["Other", 0.2],
  ]);
  expect(probe().tiles[0].color).toBe("#abcdef");
  expect(probe().tiles[1].sourceIndex).toBe(-1);
});
it("keeps controlled selection until owner changes and readout clamp inside box", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const { rerender } = render(
    model({ activeIndex: 0, onActiveIndexChange: change })
  );
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Tools, 26 percent" }));
  await settle();
  expect(probe().activeIndex).toBe(0);
  expect(change).toHaveBeenCalledWith(1);
  rerender(model({ activeIndex: 1, onActiveIndexChange: change }));
  await settle();
  expect(probe().activeIndex).toBe(1);
  expect(screen.getByText("70 · 26%")).toBeTruthy();
});
it("keeps source undivided loading box until ready and removes reduced-motion handoff", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(model({ status: "loading" }));
  await settle();
  expect(svg()).toContain("panel-treemap-skeleton");
  expect(document.querySelector(".panel-treemap-pointer")).toBeNull();
  rerender(model());
  await settle();
  expect(svg()).not.toContain("panel-treemap-skeleton");
});
const UnknownSlot = () => <span>Custom overlay</span>;
UnknownSlot.slot = "unknown";
it("falls unknown composition slots back to overlay like source", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <TreemapChart data={DATA}>
        <TreemapChart.Tiles />
        <UnknownSlot />
      </TreemapChart>
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByText("Custom overlay")).toBeTruthy();
});
it("cancels native tile target when loading replaces its canvas", async () => {
  setTestMeasurement(300, 375);
  const { rerender } = render(model({ minLabelSize: 500 }));
  await settle();
  const [tile] = probe().tiles;
  fireEvent.touchStart(
    document.querySelector(".panel-treemap-pointer") as Element,
    {
      touches: [
        {
          identifier: 1,
          x: tile.x + tile.width / 2,
          y: tile.y + tile.height / 2,
        },
      ],
    }
  );
  rerender(model({ minLabelSize: 500, status: "loading" }));
  await settle();
  rerender(model({ minLabelSize: 500 }));
  await settle();
  fireEvent.touchEnd(
    document.querySelector(".panel-treemap-pointer") as Element,
    { touches: [] }
  );
  await settle();
  expect(probe().activeIndex).toBe(-1);
});
