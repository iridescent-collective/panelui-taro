// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import {
  Plot,
  usePlot,
  usePlotAnimatedLayer,
  usePlotLayer,
} from "../src/components/Plot";
import { plotXLabels, plotYLabels } from "../src/components/Plot/axis";
import {
  plotExtent,
  plotForSize,
  plotCursorIndex,
  plotBarsPath,
  niceDomain,
  xAt,
} from "../src/components/Plot/math";
import {
  registerPlotSeries,
  unregisterPlotSeries,
  visiblePlotSeries,
} from "../src/components/Plot/registry";
import type { PlotSeriesRegistration } from "../src/components/Plot/registry";
import type {
  PlotBound,
  PlotDatum,
  PlotHandle,
} from "../src/components/Plot/types";
import { PanelUIProvider } from "../src/components/Provider";
import {
  areaPath,
  compactNumber,
  linePath,
  segment,
  barPath,
  xOf,
  yOf,
  bandOf,
} from "../src/lib/chart";
import { Circle, G, Path } from "../src/primitives/static-svg";
import fixture from "./fixtures/plot-source.json";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const DATA = [
  { label: "A", v: 10 },
  { label: "B", v: 30 },
  { label: "C", v: 20 },
];
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Probe = () => {
  const ctx = usePlot();
  return (
    <span data-testid="probe">
      {JSON.stringify({
        extent: ctx.extent,
        index: ctx.activeIndexJS,
        plot: ctx.plot,
        scale: ctx.xScale,
        series: ctx.series,
      })}
    </span>
  );
};
const probe = () =>
  JSON.parse(screen.getByTestId("probe").textContent ?? "null") as {
    extent: number[];
    series: string[][];
    index: number;
    scale: string;
    plot: { left: number; width: number };
  };
const svg = () =>
  [
    ...document.querySelectorAll<HTMLImageElement>(
      'img[src^="data:image/svg+xml"]'
    ),
  ]
    .map((img) =>
      decodeURIComponent(
        (img.getAttribute("src") ?? "").slice("data:image/svg+xml,".length)
      )
    )
    .join("\n");
const touches = (x: number, identifier = 1) => [{ identifier, x, y: 30 }];
const pointer = () => {
  const canvas = document.querySelector<HTMLCanvasElement>(
    "canvas.panel-plot-pointer"
  );
  if (!canvas) {
    throw new Error("Plot cursor missing");
  }
  return canvas;
};
const Custom = () => {
  const ctx = usePlot();
  usePlotLayer(<Circle cx={ctx.plot.left + 9} cy={35} r={7} fill="red" />);
  return null;
};
const Animated = () => {
  usePlotAnimatedLayer((ctx) => (
    <Path
      d={`M0,${ctx.domainMax.value} L10,${ctx.reveal.value}`}
      stroke="purple"
    />
  ));
  return null;
};
const pointerModel = (data = DATA) => (
  <PanelUIProvider reducedMotion>
    <Plot data={data}>
      <Plot.Bars dataKey="v" />
      <Plot.Cursor />
      <Probe />
    </Plot>
  </PanelUIProvider>
);
const markModel = (area: boolean) => (
  <PanelUIProvider reducedMotion>
    <Plot data={DATA}>
      {area ? <Plot.Area dataKey="v" color="red" /> : null}
      <Plot.Line dataKey="v" color="blue" />
      <Probe />
    </Plot>
  </PanelUIProvider>
);
const domainModel = (
  Capture: () => null,
  data = DATA,
  status: "ready" | "loading" = "ready"
) => (
  <PanelUIProvider>
    <Plot data={data} status={status}>
      <Plot.Line dataKey="v" />
      <Plot.Layer>
        <Animated />
      </Plot.Layer>
      <Capture />
    </Plot>
  </PanelUIProvider>
);
it("source extent preserves pins, bars zero baseline, nice and flat domains", () => {
  expect(plotExtent(DATA, ["v"], undefined, false, false)).toEqual([8, 32]);
  expect(plotExtent(DATA, ["v"], undefined, true, false)).toEqual([0, 33]);
  expect(
    plotExtent([{ v: -10 }, { v: -30 }], ["v"], undefined, true, false)
  ).toEqual([-33, 0]);
  expect(plotExtent(DATA, ["v"], ["auto", 25], false, true)).toEqual([10, 25]);
  expect(plotExtent(DATA, ["v"], [5, 5], true, true)).toEqual([5, 5]);
  expect(plotExtent([{ v: 7 }], ["v"], undefined, false, false)).toEqual([
    5.8, 8.2,
  ]);
  expect(plotExtent([], [], [20, "auto"], false, false)).toEqual([20, 21]);
  expect(plotForSize(300, 150, false, true)).toEqual({
    height: 116,
    left: 44,
    top: 12,
    width: 246,
  });
  expect(plotCursorIndex(95, 3, plotForSize(300, 150, false, true), true)).toBe(
    0
  );
});
it("same key reference counts survive one mark removal and restore prior color", () => {
  let entries = registerPlotSeries([], "v", "red");
  entries = registerPlotSeries(entries, "v", "blue");
  entries = registerPlotSeries(entries, "v", "red");
  expect(visiblePlotSeries(entries)).toEqual([["v", "red"]]);
  entries = unregisterPlotSeries(entries, "v", "red");
  expect(visiblePlotSeries(entries)).toEqual([["v", "blue"]]);
  entries = unregisterPlotSeries(entries, "v", "blue");
  expect(visiblePlotSeries(entries)).toEqual([["v", "red"]]);
  expect(unregisterPlotSeries(entries, "v", "absent")).toBe(entries);
});
it("renders original solid area, dots, band bars and header before drawing measurement", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Header title="Title" value="60" />
        <Plot.Legend />
        <Plot.Area dataKey="v" />
        <Plot.Line dataKey="v" />
        <Plot.Bars dataKey="v" />
        <Plot.Dots dataKey="v" />
        <Plot.Grid />
        <Plot.XAxis />
        <Plot.YAxis />
        <Plot.Rule y={15} label="Target" />
        <Probe />
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().scale).toBe("band");
  expect(probe().extent).toEqual([0, 33]);
  expect(probe().series).toHaveLength(1);
  expect(svg()).toContain('fill-opacity="0.18"');
  expect(svg()).not.toContain("linearGradient");
  expect(svg()).toContain("<circle");
  expect(screen.getByText("Title")).toBeTruthy();
  expect(screen.getByText("Target")).toBeTruthy();
});
it("real custom function marks mount, retain SVG ancestors and subscribe to geometry", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Line dataKey="v" />
        <Plot.Layer>
          <G opacity={0.5}>
            <Custom />
            <Circle cx={1} cy={2} r={3} />
          </G>
          <Animated />
        </Plot.Layer>
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  expect(svg()).toContain('opacity="0.5"');
  expect(svg()).toContain('fill="red"');
  expect(svg()).toContain('stroke="purple"');
});
it("root curve is inherited, while explicit mark curve has precedence", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA} curve="linear">
        <Plot.Line dataKey="v" color="red" />
        <Plot.Line dataKey="v" color="blue" curve="monotone" />
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const doc = new DOMParser().parseFromString(
    svg().split("\n").at(-1) ?? "",
    "image/svg+xml"
  );
  expect(
    doc.querySelector('path[stroke="red"]')?.getAttribute("d")
  ).not.toContain(" C");
  expect(doc.querySelector('path[stroke="blue"]')?.getAttribute("d")).toContain(
    " C"
  );
});
it("band cursor selects native local coordinates, deduplicates and resets cancellation", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA} onActiveIndexChange={change}>
        <Plot.Bars dataKey="v" />
        <Plot.Cursor />
        <Plot.Tooltip />
        <Probe />
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(35) });
  expect(probe().index).toBe(0);
  fireEvent.touchMove(pointer(), { touches: touches(40) });
  expect(change).toHaveBeenCalledTimes(1);
  fireEvent.touchMove(pointer(), { touches: touches(260) });
  expect(probe().index).toBe(2);
  expect(screen.getByText("C")).toBeTruthy();
  fireEvent.touchCancel(pointer());
  expect(probe().index).toBe(-1);
  expect(change).toHaveBeenLastCalledWith(-1, null);
});
it("unmounting one registered mark retains domain and legend for the remaining mark", async () => {
  setTestMeasurement(300, 375);

  const view = render(markModel(true));
  await settle();
  view.rerender(markModel(false));
  await settle();
  expect(probe().series).toEqual([["v", "blue"]]);
  expect(probe().extent).toEqual([8, 32]);
});
it("reveal replays and domain animation run without root rerendering each frame", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  const ref = createRef<PlotHandle>();
  let renders = 0;
  const Counter = () => {
    renders += 1;
    return <Probe />;
  };
  render(
    <PanelUIProvider>
      <Plot data={DATA} ref={ref}>
        <Plot.Line dataKey="v" />
        <Counter />
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const before = renders;
  act(() => {
    vi.advanceTimersByTime(700);
  });
  expect(renders).toBe(before);
  expect(readTaroStyle(document.querySelector(".overflow-hidden"))).toContain(
    "560rpx"
  );
  act(() => ref.current?.replay());
  act(() => vi.advanceTimersByTime(700));
  expect(renders).toBe(before);
  vi.useRealTimers();
});
it("domain motion interpolates atomically for 500ms and stops on loading", async () => {
  vi.useFakeTimers();
  setTestMeasurement(300, 375);
  let current: ReturnType<typeof usePlot> | undefined;
  const Capture = () => {
    current = usePlot();
    return null;
  };

  const view = render(domainModel(Capture));
  await settle();
  act(() => vi.advanceTimersByTime(700));
  view.rerender(
    domainModel(
      Capture,
      DATA.map((row) => ({ ...row, v: row.v * 2 }))
    )
  );
  act(() => vi.advanceTimersByTime(250));
  expect(current?.domainMin.value).toBeGreaterThan(8);
  expect(current?.domainMin.value).toBeLessThan(16);
  expect(current?.domainMax.value).toBeGreaterThan(32);
  expect(current?.domainMax.value).toBeLessThan(64);
  act(() => vi.advanceTimersByTime(250));
  expect(current?.domainMin.value).toBe(16);
  expect(current?.domainMax.value).toBe(64);
  view.rerender(domainModel(Capture, DATA));
  act(() => vi.advanceTimersByTime(100));
  const before = current?.domainMax.value;
  view.rerender(domainModel(Capture, DATA, "loading"));
  act(() => vi.advanceTimersByTime(1000));
  expect(current?.domainMax.value).toBe(before);
  expect(current?.reveal.value).toBe(0);
  vi.useRealTimers();
});
it("pointer viewport scale is captured once and dataset or foreign touch cancels selection", async () => {
  setTestMeasurement(300, 750);

  const view = render(pointerModel());
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(520) });
  expect(probe().index).toBe(2);
  fireEvent.touchMove(pointer(), { touches: touches(70, 2) });
  expect(probe().index).toBe(-1);
  fireEvent.touchStart(pointer(), { touches: touches(520) });
  view.rerender(pointerModel([...DATA]));
  expect(probe().index).toBe(-1);
});
it("equal pinned domains omit line/area paths and support explicit point scale over bars", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA} yDomain={[5, 5]} xScale="point">
        <Plot.Line dataKey="v" />
        <Plot.Area dataKey="v" />
        <Plot.Bars dataKey="v" />
        <Probe />
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  expect(probe().scale).toBe("point");
  expect(svg()).not.toContain("NaN");
  expect(svg()).not.toContain("Infinity");
  expect(svg()).toContain('d=""');
});
it("Overlay passes through its frame and enables only bounded interactive children", async () => {
  setTestMeasurement(300, 375);
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Line dataKey="v" />
        <Plot.Cursor />
        <Plot.Overlay>
          <button
            type="button"
            style={{ position: "absolute", right: 0, top: 0 }}
            onClick={press}
          >
            Overlay action
          </button>
        </Plot.Overlay>
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const button = screen.getByText("Overlay action");
  expect(button.getAttribute("style")).toContain("pointer-events: auto");
  expect(readTaroStyle(button.parentElement)).toContain("pointerEvents");
  fireEvent.click(button);
  expect(press).toHaveBeenCalledOnce();
  fireEvent.touchStart(pointer(), { touches: touches(35) });
  fireEvent.touchEnd(pointer());
});

it.each(fixture.extents)("pinned extent %#", (item) => {
  expect(
    plotExtent(
      item.data as PlotDatum[],
      item.seriesKeys,
      item.yDomain === null
        ? undefined
        : (item.yDomain as [PlotBound, PlotBound]),
      item.hasBars,
      item.nice
    )
  ).toEqual(item.output);
});
it.each(fixture.sizes)("pinned size %#", (item) => {
  expect(
    plotForSize(item.width, item.height, item.compact, item.hasYAxis)
  ).toEqual(item.output);
});
it.each(fixture.cursors)("pinned cursor %#", (item) => {
  expect(plotCursorIndex(item.x, item.total, item.plot, item.banded)).toEqual(
    item.output
  );
});
it.each(fixture.bars)("pinned bar paths %#", (item) => {
  expect(
    plotBarsPath(
      item.values,
      item.plot,
      item.min,
      item.max,
      item.gap,
      item.radius,
      item.baseline
    )
  ).toEqual(item.output);
});
it.each(fixture.xTicks)("pinned x labels %#", (item) => {
  expect(plotXLabels(item.data as PlotDatum[], "label", item.ticks)).toEqual(
    item.output
  );
});
it.each(fixture.yTicks)("pinned y labels %#", (item) => {
  expect(plotYLabels(item.extent as [number, number], item.ticks)).toEqual(
    item.output
  );
});
it.each(fixture.paths)("pinned paths %#", (item) => {
  const args: unknown[] = [...item.args];
  if (item.kind === "linePath" || item.kind === "areaPath") {
    args[6] ??= undefined;
  }
  let actual: string;
  switch (item.kind) {
    case "linePath": {
      actual = linePath(...(args as Parameters<typeof linePath>));
      break;
    }
    case "areaPath": {
      actual = areaPath(...(args as Parameters<typeof areaPath>));
      break;
    }
    case "segment": {
      actual = segment(...(args as Parameters<typeof segment>));
      break;
    }
    default: {
      actual = barPath(...(args as Parameters<typeof barPath>));
    }
  }
  expect(actual).toEqual(item.output);
});
it.each(fixture.scales)("pinned scales %#", (item) => {
  let actual: string | number | [number, number];
  switch (item.kind) {
    case "compactNumber": {
      actual = compactNumber(
        ...(item.args as Parameters<typeof compactNumber>)
      );
      break;
    }
    case "xOf": {
      actual = xOf(...(item.args as Parameters<typeof xOf>));
      break;
    }
    case "bandOf": {
      actual = bandOf(...(item.args as Parameters<typeof bandOf>));
      break;
    }
    case "xAt": {
      actual = xAt(...(item.args as Parameters<typeof xAt>));
      break;
    }
    case "yOf": {
      actual = yOf(...(item.args as Parameters<typeof yOf>));
      break;
    }
    default: {
      actual = niceDomain(...(item.args as Parameters<typeof niceDomain>));
    }
  }
  expect(actual).toEqual(item.output);
});
it("pinned reference registry sequence", () => {
  let entries: PlotSeriesRegistration[] = [];
  for (const item of fixture.registrations) {
    const previous = entries;
    const { kind, key, color } = item.operation;
    entries =
      kind === "register"
        ? registerPlotSeries(entries, key, color ?? "")
        : unregisterPlotSeries(entries, key, color ?? undefined);
    expect(entries).toEqual(item.output);
    expect(visiblePlotSeries(entries)).toEqual(item.visible);
    expect(entries === previous).toBe(item.sameReference);
  }
});
const OrderedMark = ({ color }: { color: string }) => {
  usePlotLayer(<Circle cx={50} cy={50} r={8} fill={color} />);
  return null;
};
const orderedModel = (reverse: boolean) => (
  <PanelUIProvider reducedMotion>
    <Plot data={DATA}>
      <Plot.Line dataKey="v" />
      <Plot.Layer>
        {reverse
          ? [
              <OrderedMark key="blue" color="blue" />,
              <OrderedMark key="red" color="red" />,
            ]
          : [
              <OrderedMark key="red" color="red" />,
              <OrderedMark key="blue" color="blue" />,
            ]}
      </Plot.Layer>
    </Plot>
  </PanelUIProvider>
);
it("stable keyed custom marks follow Layer child painting order after reorder", async () => {
  setTestMeasurement(300, 375);
  const view = render(orderedModel(false));
  await settle();
  expect(svg().indexOf('fill="red"')).toBeLessThan(
    svg().indexOf('fill="blue"')
  );
  view.rerender(orderedModel(true));
  await settle();
  expect(svg().indexOf('fill="blue"')).toBeLessThan(
    svg().indexOf('fill="red"')
  );
});
const dashedModel = () => (
  <PanelUIProvider reducedMotion>
    <Plot data={DATA}>
      <Plot.Line dataKey="v" />
      <Plot.Rule y={20} dashed label="Horizontal" />
      <Plot.Rule x={1} dashed label="Vertical" />
    </Plot>
  </PanelUIProvider>
);
const browserStrokeWidth = (label: string, direction: "top" | "left") => {
  const element = screen.getByText(label).parentElement?.firstElementChild;
  const style = JSON.parse(readTaroStyle(element) ?? "{}") as Record<
    string,
    string | number
  >;
  const sample = document.createElement("div");
  for (const [key, value] of Object.entries(style)) {
    sample.style.setProperty(
      key.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`),
      String(value).replaceAll("rpx", "px")
    );
  }
  return sample.style.getPropertyValue(`border-${direction}-width`);
};
it("dashed Rule direction width survives CSS shorthand application", async () => {
  setTestMeasurement(300, 375);
  render(dashedModel());
  await settle();
  expect(browserStrokeWidth("Horizontal", "top")).toBe("2px");
  expect(browserStrokeWidth("Vertical", "left")).toBe("2px");
});
const loadingTooltipModel = (loading: boolean, content: () => string) => (
  <PanelUIProvider reducedMotion>
    <Plot data={DATA} status={loading ? "loading" : "ready"}>
      <Plot.Line dataKey="v" />
      <Plot.Cursor />
      <Plot.Tooltip>{content}</Plot.Tooltip>
    </Plot>
  </PanelUIProvider>
);
it("loading excludes Tooltip and never calls its custom content with stale selection", async () => {
  setTestMeasurement(300, 375);
  const content = vi.fn(() => "Selected content");
  const view = render(loadingTooltipModel(false, content));
  await settle();
  fireEvent.touchStart(pointer(), { touches: touches(160) });
  expect(content).toHaveBeenCalled();
  content.mockClear();
  view.rerender(loadingTooltipModel(true, content));
  expect(content).not.toHaveBeenCalled();
  expect(screen.queryByText("Selected content")).toBeNull();
});
it("nested Layer preserves parent paint position and applies group opacity once", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Line dataKey="v" />
        <Plot.Layer>
          <G opacity={0.5}>
            <OrderedMark color="red" />
            <Plot.Layer>
              <OrderedMark color="blue" />
            </Plot.Layer>
            <OrderedMark color="green" />
          </G>
        </Plot.Layer>
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const decoded = svg();
  expect(decoded.indexOf('fill="red"')).toBeLessThan(
    decoded.indexOf('fill="blue"')
  );
  expect(decoded.indexOf('fill="blue"')).toBeLessThan(
    decoded.indexOf('fill="green"')
  );
  const doc = new DOMParser().parseFromString(
    decoded.split("\n").at(-1) ?? "",
    "image/svg+xml"
  );
  const blue = doc.querySelector('circle[fill="blue"]');
  expect(blue?.parentElement?.getAttribute("opacity")).toBe("0.5");
  expect(blue?.parentElement?.parentElement?.getAttribute("opacity")).not.toBe(
    "0.5"
  );
});
it("built-in marks remain inside Layer groups and preserve mixed child paint order", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Layer>
          <G opacity={0.6}>
            <OrderedMark color="red" />
            <Plot.Line dataKey="v" color="blue" />
            <OrderedMark color="green" />
          </G>
        </Plot.Layer>
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const decoded = svg();
  expect(decoded.indexOf('fill="red"')).toBeLessThan(
    decoded.indexOf('stroke="blue"')
  );
  expect(decoded.indexOf('stroke="blue"')).toBeLessThan(
    decoded.indexOf('fill="green"')
  );
  const doc = new DOMParser().parseFromString(
    decoded.split("\n").at(-1) ?? "",
    "image/svg+xml"
  );
  expect(
    doc
      .querySelector('path[stroke="blue"]')
      ?.parentElement?.getAttribute("opacity")
  ).toBe("0.6");
});
it("mixed Layer preserves one SVG group compositing boundary for overlapping marks", async () => {
  setTestMeasurement(300, 375);
  render(
    <PanelUIProvider reducedMotion>
      <Plot data={DATA}>
        <Plot.Layer>
          <G opacity={0.5}>
            <OrderedMark color="red" />
            <Plot.Line dataKey="v" color="blue" />
            <Circle cx={50} cy={50} r={8} fill="green" />
          </G>
        </Plot.Layer>
      </Plot>
    </PanelUIProvider>
  );
  await settle();
  const doc = new DOMParser().parseFromString(
    svg().split("\n").at(-1) ?? "",
    "image/svg+xml"
  );
  expect(doc.querySelectorAll('g[opacity="0.5"]')).toHaveLength(1);
  expect(doc.querySelector('g[opacity="0.5"]')?.children).toHaveLength(3);
});
