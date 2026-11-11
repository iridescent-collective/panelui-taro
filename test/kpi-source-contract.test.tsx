// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";

import { Kpi } from "../src/components/Kpi";
import type { KpiGoodDirection, KpiTone } from "../src/components/Kpi";
import { kpiTrendTone } from "../src/components/Kpi/trend";
import { kpiVariants } from "../src/components/Kpi/variants";
import { PanelUIProvider } from "../src/components/Provider";
import { THEME_TOKENS } from "../src/theme/tokens";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const CASES: [number, number, KpiGoodDirection, KpiTone][] = [
  [12.4, 0, "up", "good"],
  [-4.2, 0, "up", "bad"],
  [12.4, 0, "down", "bad"],
  [-4.2, 0, "down", "good"],
  [0, 0, "up", "flat"],
  [0.2, 0.2, "down", "flat"],
  [-0.2, 0.2, "up", "flat"],
  [4, 0, "none", "neutral"],
  [-4, 0, "none", "neutral"],
];
it.each(CASES)(
  "maps source trend %s threshold %s polarity %s to %s",
  (value, threshold, polarity, tone) => {
    expect(kpiTrendTone(value, threshold, polarity)).toBe(tone);
  }
);
it.each(["good", "bad", "flat", "neutral"] as const)(
  "preserves badge compound variant %s",
  (tone) => {
    const slots = kpiVariants({ tone, trendVariant: "badge" });
    const backgrounds = {
      bad: "destructive-subtle",
      flat: "muted",
      good: "success-subtle",
      neutral: "muted",
    };
    const background = backgrounds[tone];
    expect(slots.trend()).toContain(`bg-[var(--panel-${background})]`);
  }
);
it("preserves surface, hierarchy, title growth only inside header and trend alignment inside stat", () => {
  render(
    <PanelUIProvider>
      <Kpi>
        <Kpi.Title>Standalone</Kpi.Title>
        <Kpi.Header>
          <Kpi.Title>Heading</Kpi.Title>
          <Kpi.Actions>Actions</Kpi.Actions>
        </Kpi.Header>
        <Kpi.Content layout="inline">
          <Kpi.Stat>
            <Kpi.Title>Stacked</Kpi.Title>
            <Kpi.Value>12,480</Kpi.Value>
            <Kpi.Trend value={12.4} caption="last 30d" />
          </Kpi.Stat>
        </Kpi.Content>
        <Kpi.Separator />
        <Kpi.Footer>Footnote</Kpi.Footer>
      </Kpi>
    </PanelUIProvider>
  );
  expect(screen.getByText("Heading").className).toContain("flex-1");
  expect(screen.getByText("Standalone").className).not.toContain("flex-1");
  expect(screen.getByText("Stacked").className).not.toContain("flex-1");
  expect(screen.getByText("12,480").className).toContain("text-[48px]");
  expect(
    screen.getByLabelText("Up 12.4 percent, last 30d").className
  ).toContain("self-start");
  expect(screen.getByText("last 30d").parentElement?.textContent).toBe(
    "+12.4% last 30d"
  );
  expect(document.querySelector("img")).toBeNull();
});
it("uses polarity overrides, true minus, source 12dp arrow and caption semantics", () => {
  render(
    <PanelUIProvider>
      <Kpi goodDirection="up" surface={false}>
        <Kpi.Trend
          value={-4.2}
          goodDirection="down"
          variant="badge"
          caption="vs week"
        />
        <Kpi.Trend value={0} variant="badge" />
        <Kpi.Trend value={5} format={(value) => `${value} points`} />
      </Kpi>
    </PanelUIProvider>
  );
  const down = screen.getByLabelText("Down 4.2 percent, vs week");
  expect(down.textContent).toBe("−4.2% vs week");
  expect(down.className).toContain("success-subtle");
  expect(
    JSON.parse(readTaroStyle(down.querySelector("img")) ?? "{}").width
  ).toBe("24rpx");
  expect(down.querySelector("img")?.getAttribute("src")).toContain(
    encodeURIComponent(THEME_TOKENS.light.success)
  );
  expect(screen.getByText("5 points")).toBeTruthy();
  expect(screen.getByLabelText("No change 0.0 percent").className).toContain(
    "muted"
  );
});
it("composes compact SVG sparkline with inherited series color and progress range", async () => {
  setTestMeasurement(128, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Kpi colorIndex={2}>
        <Kpi.Chart inline data={[{ v: 1 }, { v: 2 }, { v: 3 }]} dataKey="v" />
        <Kpi.Progress value={25} maxValue={50} label="Goal" showValueLabel />
      </Kpi>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
  const svgs = [...document.querySelectorAll("img")].map((img) =>
    decodeURIComponent(img.getAttribute("src")?.split(",")[1] ?? "")
  );
  expect(svgs.some((svg) => svg.includes('stroke="#3b82f6"'))).toBe(true);
  expect(svgs.some((svg) => svg.includes("linearGradient"))).toBe(false);
  expect(document.querySelector("canvas")).toBeNull();
  expect(screen.getByRole("progressbar").getAttribute("aria-valuemax")).toBe(
    "50"
  );
  expect(screen.getByText("50%")).toBeTruthy();
});
const Stateful = ({ label }: { label: string }) => {
  const [value, setValue] = useState(0);
  return (
    <button onClick={() => setValue(value + 1)}>
      {label} {value}
    </button>
  );
};
const items = (reversed = false) => (
  <Kpi.Group orientation="horizontal">
    {(reversed ? ["B", "A"] : ["A", "B"]).map((label) => (
      <Stateful key={label} label={label} />
    ))}
    {null}
    {false}
  </Kpi.Group>
);
it("places separators between visible cells and preserves keyed children on reorder", () => {
  const view = render(items());
  fireEvent.click(screen.getByRole("button", { name: "A 0" }));
  view.rerender(items(true));
  expect(screen.getByRole("button", { name: "A 1" })).toBeTruthy();
  expect(document.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
  expect(document.querySelector('[aria-hidden="true"]')?.className).toContain(
    "w-[2px]"
  );
  view.rerender(
    <Kpi.Group orientation="vertical" separated={false}>
      <Kpi.Value>A</Kpi.Value>
      <Kpi.Value>B</Kpi.Value>
    </Kpi.Group>
  );
  expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
  expect(
    screen.getByText("A").parentElement?.parentElement?.className
  ).toContain("gap-[24px]");
});

it("allows equal-width horizontal cells to shrink below chart intrinsic width after a vertical layout", () => {
  const content = (
    <>
      <Kpi.Value>Visits</Kpi.Value>
      <Kpi.Value>Missed tasks</Kpi.Value>
    </>
  );
  const view = render(
    <Kpi.Group orientation="vertical">{content.props.children}</Kpi.Group>
  );
  expect(screen.getByText("Visits").parentElement?.className).toContain(
    "w-full"
  );
  view.rerender(
    <Kpi.Group orientation="horizontal">{content.props.children}</Kpi.Group>
  );
  for (const label of ["Visits", "Missed tasks"]) {
    const cell = screen.getByText(label).parentElement;
    expect(cell?.className).toContain("flex-1");
    expect(cell?.className).toContain("min-w-0");
  }
  view.rerender(
    <Kpi.Group orientation="vertical">{content.props.children}</Kpi.Group>
  );
  for (const label of ["Visits", "Missed tasks"]) {
    const cell = screen.getByText(label).parentElement;
    expect(cell?.className).toContain("w-full");
    expect(cell?.className).not.toContain("flex-1");
  }
});
