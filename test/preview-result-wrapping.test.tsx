// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { AreaChartShowcase } from "../example/src/components/AreaChartShowcase";
import { BarChartShowcase } from "../example/src/components/BarChartShowcase";
import { ColorPickerShowcase } from "../example/src/components/ColorPickerShowcase";
import { LineChartShowcase } from "../example/src/components/LineChartShowcase";
import { PieChartShowcase } from "../example/src/components/PieChartShowcase";
import { PolarAreaChartShowcase } from "../example/src/components/PolarAreaChartShowcase";
import { RingChartShowcase } from "../example/src/components/RingChartShowcase";
import { SearchBarShowcase } from "../example/src/components/SearchBarShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it.each([
  {
    Component: ColorPickerShowcase,
    action: "Use wheel",
    field: "wheel",
    id: "panel-color-picker-result",
    initial: {
      commit: "",
      disabled: false,
      rtl: false,
      value: "#0a84ff",
      wheel: false,
    },
    next: true,
  },
  {
    Component: LineChartShowcase,
    action: "Update domain",
    field: "expanded",
    id: "panel-line-chart-result",
    initial: {
      active: -1,
      axis: true,
      curve: "monotone",
      expanded: false,
      lastSelected: -1,
      loading: false,
    },
    next: true,
  },
  {
    Component: AreaChartShowcase,
    action: "Overlay bands",
    field: "stacked",
    id: "panel-area-result",
    initial: { lastSelected: -1, linear: false, loading: false, stacked: true },
    next: false,
  },
  {
    Component: BarChartShowcase,
    action: "Stack bars",
    field: "stacked",
    id: "panel-bar-result",
    initial: {
      horizontal: false,
      lastSelected: -1,
      loading: false,
      stacked: false,
    },
    next: true,
  },
  {
    Component: PieChartShowcase,
    action: "Solid pie",
    field: "donut",
    id: "panel-pie-result",
    initial: {
      active: -1,
      donut: true,
      loading: false,
      partial: false,
      rounded: false,
    },
    next: false,
  },
  {
    Component: PolarAreaChartShowcase,
    action: "Area carries value",
    field: "area",
    id: "panel-polar-result",
    initial: {
      active: -1,
      area: false,
      fixed: false,
      loading: false,
      rounded: false,
    },
    next: true,
  },
  {
    Component: RingChartShowcase,
    action: "Toggle small hole",
    field: "compact",
    id: "panel-ring-result",
    initial: { active: -1, compact: false, gauge: false, segmented: false },
    next: true,
  },
  {
    Component: SearchBarShowcase,
    action: "Remove Library",
    field: "tokens",
    id: "panel-search-result",
    initial: { query: "", settled: "", submitted: "", tokens: ["Library"] },
    next: [],
  },
])(
  "$id wraps its complete JSON within a narrow preview",
  ({ action, Component, field, id, initial, next }) => {
    const style = document.createElement("style");
    style.textContent =
      ".block{display:block}.w-full{width:100%}.min-w-0{min-width:0px}.max-w-full{max-width:100%}.break-all{word-break:break-all}.whitespace-normal{white-space:normal}";
    document.head.append(style);
    try {
      const view = render(
        <PanelUIProvider reducedMotion>
          <Component />
        </PanelUIProvider>
      );
      view.container.style.width = "180px";
      const result = document.querySelector(`#${id}`);
      expect(result).not.toBeNull();
      if (!result) {
        throw new Error(`Missing preview result ${id}`);
      }
      const computed = getComputedStyle(result);
      expect(computed.display).toBe("block");
      expect(computed.width).toBe("100%");
      expect(computed.maxWidth).toBe("100%");
      expect(computed.minWidth).toBe("0px");
      expect(computed.wordBreak).toBe("break-all");
      expect(computed.whiteSpace).toBe("normal");
      expect(JSON.parse(result.textContent ?? "")).toEqual(initial);
      fireEvent.click(screen.getByRole("button", { name: action }));
      expect(document.querySelector(`#${id}`)).toBe(result);
      expect(JSON.parse(result.textContent ?? "")).toEqual({
        ...initial,
        [field]: next,
      });
    } finally {
      style.remove();
    }
  }
);
