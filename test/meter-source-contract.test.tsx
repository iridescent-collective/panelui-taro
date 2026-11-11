// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { expect, it } from "vitest";

import { Meter } from "../src/components/Meter";
import {
  normalizeScale,
  normalizeSegments,
} from "../src/components/Meter/meter-scale";
import { PanelUIProvider } from "../src/components/Provider";

it("scale handles invalid and enormous ranges consistently for fill and accessibility", () => {
  expect(normalizeScale(0, -1e308, 1e308).fraction).toBe(0.5);
  const { rerender } = render(
    <Meter value={Infinity} minValue={20} maxValue={10} />
  );
  const meter = screen.getByRole("progressbar");
  expect(meter.getAttribute("aria-valuemin")).toBe("20");
  expect(meter.getAttribute("aria-valuemax")).toBe("20");
  expect(meter.getAttribute("aria-valuenow")).toBe("20");
  rerender(<Meter value={Number.NaN} />);
  expect(meter.getAttribute("aria-valuenow")).toBe("0");
});

it("highest reached threshold wins independent of order and segmented readings never hide a positive value", () => {
  render(
    <Meter
      value={1}
      segments={4}
      thresholds={[
        { color: "success", from: 0 },
        { color: "destructive", from: Number.NaN },
        { color: "warning", from: -20 },
      ]}
    />
  );
  const meter = screen.getByRole("progressbar");
  expect(meter.children).toHaveLength(4);
  expect(meter.children[0].className).toContain("bg-[var(--panel-success)]");
  expect(meter.children[0].getAttribute("style")).toContain("opacity: 1");
  expect(meter.children[1].getAttribute("style")).toContain("opacity: 0.22");
  expect(normalizeSegments(1e9)).toBe(100);
  expect(normalizeSegments(0.2)).toBe(0);
});

it("a value label is spoken even when hidden and the ref belongs to the track", () => {
  const ref = createRef<ComponentRef<typeof Meter>>();
  const { rerender } = render(
    <Meter ref={ref} value={75} label="电量" valueLabel="充足" />
  );
  expect(ref.current).toBe(screen.getByRole("progressbar"));
  expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
    "充足"
  );
  expect(screen.queryByText("充足")).toBeNull();
  rerender(
    <PanelUIProvider reducedMotion>
      <Meter value={75} label="电量" valueLabel="充足" showValueLabel />
    </PanelUIProvider>
  );
  expect(screen.getByText("充足")).toBeTruthy();
  expect(
    screen.getByRole("progressbar").firstElementChild?.getAttribute("style")
  ).toContain("transition: none");
});
