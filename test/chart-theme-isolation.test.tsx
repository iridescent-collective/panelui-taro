// @vitest-environment happy-dom

import { act, fireEvent, render } from "@testing-library/react";
import { expect, it } from "vitest";

import { BumpChart } from "../src/components/BumpChart";
import { LiveLineChart } from "../src/components/LiveLineChart";
import { MirrorAreaChart } from "../src/components/MirrorAreaChart";
import { PanelUIProvider } from "../src/components/Provider";
import { SankeyChart } from "../src/components/SankeyChart";
import { TreemapChart } from "../src/components/TreemapChart";
import { setTestMeasurement } from "./taro-api";

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const assertCard = (
  background: "popover" | "background",
  radius: "xl" | "lg" | "md"
) => {
  const card = document.querySelector(".theme-contract-card");
  expect(card).toBeTruthy();
  expect(card?.className).toContain(`bg-[var(--panel-${background})]`);
  expect(card?.className).toContain("border-[var(--panel-border)]");
  expect(card?.className).toContain("border-[2px]");
  expect(card?.className).toContain(`rounded-[var(--panel-radius-${radius})]`);
};
it.each(["bump", "mirror"] as const)(
  "isolates %s readout surface from host semantic classes",
  async (kind) => {
    setTestMeasurement(300, 375);
    const data = [
      { date: "Mon", value: 1 },
      { date: "Tue", value: 2 },
    ];
    render(
      <PanelUIProvider reducedMotion>
        {kind === "bump" ? (
          <BumpChart data={data}>
            <BumpChart.Line dataKey="value" />
            <BumpChart.Tooltip className="theme-contract-card" />
          </BumpChart>
        ) : (
          <MirrorAreaChart data={data}>
            <MirrorAreaChart.Area dataKey="value" />
            <MirrorAreaChart.Tooltip className="theme-contract-card" />
          </MirrorAreaChart>
        )}
      </PanelUIProvider>
    );
    await settle();
    fireEvent.touchStart(
      document.querySelector(`.panel-${kind}-pointer`) as Element,
      { touches: [{ identifier: 1, x: 20, y: 20 }] }
    );
    await settle();
    assertCard("popover", "xl");
  }
);
it("isolates live readout and tip badge theme and dimensions", async () => {
  setTestMeasurement(300, 375);
  const now = Date.now();
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <LiveLineChart data={[{ time: now, value: 12 }]}>
        <LiveLineChart.Tip
          badge
          pulse={false}
          className="theme-contract-card"
        />
      </LiveLineChart>
    </PanelUIProvider>
  );
  await settle();
  assertCard("popover", "md");
  rerender(
    <PanelUIProvider reducedMotion>
      <LiveLineChart data={[{ time: now, value: 12 }]}>
        <LiveLineChart.Tooltip className="theme-contract-card" />
      </LiveLineChart>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchStart(
    document.querySelector(".panel-live-pointer") as Element,
    { touches: [{ identifier: 1, x: 20, y: 20 }] }
  );
  await settle();
  assertCard("popover", "lg");
});
it("isolates treemap selected readout theme", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <TreemapChart data={[{ label: "A", value: 10 }]} activeIndex={0}>
        <TreemapChart.Tooltip className="theme-contract-card" />
      </TreemapChart>
    </PanelUIProvider>
  );
  await settle();
  assertCard("popover", "lg");
});
it("isolates Sankey translucent label backdrop and selected card from host theme", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <SankeyChart
        nodes={[{ id: "A" }, { id: "B" }]}
        links={[{ source: "A", target: "B", value: 10 }]}
        activeId="A"
      >
        <SankeyChart.Labels className="theme-label-wrapper" />
        <SankeyChart.Tooltip className="theme-contract-card" />
      </SankeyChart>
    </PanelUIProvider>
  );
  await settle();
  assertCard("background", "lg");
  const backdrop = document.querySelector(
    '.theme-label-wrapper [class*="bg-"]'
  );
  expect(backdrop?.className).toContain(
    "bg-[var(--panel-background-opacity-80)]"
  );
  expect(backdrop?.className).toContain("rounded-[var(--panel-radius-md)]");
});
