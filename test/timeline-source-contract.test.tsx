// @vitest-environment happy-dom

import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Timeline } from "../src/components/Timeline";
import {
  itemWidth,
  timelineColumnWidth,
  timelineColumnOffsets,
  timelineMountRange,
} from "../src/components/Timeline/geometry";
import fixtures from "./fixtures/timeline-source.json";
import { TARO_TEST_EVENTS, dispatchTaroEvent } from "./taro-components";

const required = (node: Element | null | undefined) => {
  if (!node) {
    throw new Error("Expected timeline node");
  }
  return node;
};
for (const fixture of fixtures.widths) {
  it(`source column width ${fixture.requested} / filled ${fixture.filled}`, () => {
    let width: number | undefined = Number(fixture.requested);
    if (fixture.requested === "undefined") {
      width = undefined;
    } else if (fixture.requested === "NaN") {
      width = Number.NaN;
    } else if (fixture.requested === "Infinity") {
      width = Infinity;
    }
    expect(timelineColumnWidth(width, fixture.filled)).toBe(fixture.result);
  });
}
for (const fixture of fixtures.offsets) {
  it(`source column offsets ${fixture.input.join(",")}`, () => {
    expect(timelineColumnOffsets(fixture.input)).toEqual(fixture.result);
  });
}
it("retains 16 compound parts and the source filled-content width predicate", () => {
  expect(
    Object.keys(Timeline).filter(
      (key) => key !== "$$typeof" && key !== "render" && key !== "displayName"
    )
  ).toEqual(
    expect.arrayContaining([
      "List",
      "Item",
      "Aside",
      "Masthead",
      "Indicator",
      "Content",
      "Header",
      "Heading",
      "Date",
      "Label",
      "Meta",
      "Title",
      "Trailing",
      "Description",
      "Stats",
      "Stat",
    ])
  );
  expect(itemWidth({ children: <Timeline.Content />, step: 1 })).toBe(76);
  expect(
    itemWidth({ children: <Timeline.Content>{0}</Timeline.Content>, step: 1 })
  ).toBe(268);
  expect(
    itemWidth({
      children: <Timeline.Content>{false}</Timeline.Content>,
      step: 1,
    })
  ).toBe(76);
  expect(
    itemWidth({
      children: (
        <>
          <Timeline.Content>Nested</Timeline.Content>
        </>
      ),
      step: 1,
    })
  ).toBe(76);
});
it("source progress is inclusive, explicit false overrides it, tones retain their own fills, and last stops the connector", () => {
  const { container } = render(
    <PanelUIProvider>
      <Timeline variant="numbered" value={2}>
        <Timeline.Item step={2}>
          <Timeline.Indicator id="done" />
          <Timeline.Content>
            <Timeline.Title>Completed</Timeline.Title>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item step={1} completed={false} tone="info" last>
          <Timeline.Indicator id="override" />
          <Timeline.Content>Pending</Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </PanelUIProvider>
  );
  expect(container.querySelector("#done")?.className).toContain(
    "--panel-primary"
  );
  expect(container.querySelector("#override")?.className).toContain(
    "--panel-info-soft"
  );
  expect(screen.getByText("3")).toBeTruthy();
  expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1);
});
it("horizontal offsets use render order rather than sparse semantic steps and reserve the same aside band", () => {
  const { container, rerender } = render(
    <PanelUIProvider>
      <Timeline orientation="horizontal">
        <Timeline.Item step={999} id="first">
          <Timeline.Indicator />
          <Timeline.Content>
            <Timeline.Description>First content</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
        <Timeline.Item step={-3} width={140} id="second">
          <Timeline.Aside id="aside">
            <Timeline.Date>2005</Timeline.Date>
          </Timeline.Aside>
          <Timeline.Indicator />
          <Timeline.Content>
            <Timeline.Description>Second content</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </PanelUIProvider>
  );
  const scroll = container.querySelector('[data-taro-scroll-x="true"]');
  expect(scroll).toBeTruthy();
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>("#first")?.dataset.taroStyle ?? "{}"
    ).width
  ).toBe("536rpx");
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>("#second")?.dataset.taroStyle ?? "{}"
    ).paddingTop
  ).toBe("128rpx");
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>("#aside")?.dataset.taroStyle ?? "{}"
    ).marginTop
  ).toBe("-128rpx");
  act(() =>
    dispatchTaroEvent(required(scroll), TARO_TEST_EVENTS.scroll, {
      scrollLeft: 268,
    })
  );
  expect(
    container.querySelector<HTMLElement>("#first")?.style.transform
  ).toContain("scale(0.96)");
  expect(
    container.querySelector<HTMLElement>("#second")?.style.transform
  ).toContain("scale(1)");
  expect(screen.getByText("Second content").style.color).toBe("#262626");
  rerender(
    <PanelUIProvider reducedMotion>
      <Timeline orientation="horizontal">
        <Timeline.Item step={999} id="first">
          <Timeline.Content>First content</Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </PanelUIProvider>
  );
  expect(container.querySelector<HTMLElement>("#first")?.style.transform).toBe(
    ""
  );
});
it("reports one change per nearest-column crossing even when snap is disabled", () => {
  const change = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Timeline orientation="horizontal" snap={false} onColumnChange={change}>
        <Timeline.Item step={100}>
          <Timeline.Content>A</Timeline.Content>
        </Timeline.Item>
        <Timeline.Item step={-50}>
          <Timeline.Content>B</Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </PanelUIProvider>
  );
  const scroll = container.querySelector('[data-taro-scroll-x="true"]');
  act(() =>
    dispatchTaroEvent(required(scroll), TARO_TEST_EVENTS.scroll, {
      scrollLeft: 140,
    })
  );
  act(() =>
    dispatchTaroEvent(required(scroll), TARO_TEST_EVENTS.scroll, {
      scrollLeft: 160,
    })
  );
  act(() =>
    dispatchTaroEvent(required(scroll), TARO_TEST_EVENTS.scroll, {
      scrollLeft: 10,
    })
  );
  expect(change.mock.calls).toEqual([[1], [0]]);
});
it("horizontal List bounds mounting, keeps source offsets and overrides author step/width/last", () => {
  const data = Array.from({ length: 1000 }, (_, index) => index);
  const renderItem = vi.fn(({ item }: { item: number }) => (
    <Timeline.Item step={9999} width={1} id={`row-${item}`}>
      <Timeline.Aside>
        <Timeline.Date>{item}</Timeline.Date>
      </Timeline.Aside>
      <Timeline.Indicator />
      <Timeline.Content>Record</Timeline.Content>
    </Timeline.Item>
  ));
  const { container } = render(
    <PanelUIProvider>
      <Timeline.List
        data={data}
        renderItem={renderItem}
        itemWidth={140}
        id="history"
      />
    </PanelUIProvider>
  );
  expect(renderItem.mock.calls.length).toBeLessThan(20);
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>("#row-0")?.dataset.taroStyle ?? "{}"
    ).width
  ).toBe("280rpx");
  act(() =>
    dispatchTaroEvent(
      required(container.querySelector("#history")),
      TARO_TEST_EVENTS.scroll,
      { scrollLeft: 14_000 }
    )
  );
  expect(container.querySelector<HTMLElement>("#row-0")).toBeNull();
  expect(container.querySelector("#row-100")).toBeTruthy();
  expect(container.querySelectorAll('[role="listitem"]').length).toBeLessThan(
    20
  );
  expect(
    timelineMountRange([0, 140, 280], [140, 140, 140], 0, 375, 5, 6)
  ).toEqual({ end: 3, start: 0 });
});
it("masthead is outside-context safe, card panel owns its border, and all text/stats parts compose", () => {
  render(
    <PanelUIProvider>
      <Timeline.Masthead
        label="Built for"
        title="Learning"
        media={<span>Media</span>}
      />
      <Timeline variant="card">
        <Timeline.Item step={0}>
          <Timeline.Indicator />
          <Timeline.Content>
            <Timeline.Header>
              <Timeline.Heading>
                <Timeline.Title>Card</Timeline.Title>
                <Timeline.Meta>Meta</Timeline.Meta>
              </Timeline.Heading>
              <Timeline.Trailing>Today</Timeline.Trailing>
            </Timeline.Header>
            <Timeline.Description>Details</Timeline.Description>
            <Timeline.Stats>
              <Timeline.Stat label="Days" value="7" />
            </Timeline.Stats>
          </Timeline.Content>
        </Timeline.Item>
      </Timeline>
    </PanelUIProvider>
  );
  for (const label of [
    "Learning",
    "Media",
    "Card",
    "Meta",
    "Today",
    "Details",
    "Days",
    "7",
  ]) {
    expect(screen.getByText(label)).toBeTruthy();
  }
});
it.each(["vertical", "horizontal"] as const)(
  "%s statistics stack the label above the value like the source View",
  (orientation) => {
    const style = document.createElement("style");
    style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
    document.head.append(style);
    try {
      render(
        <PanelUIProvider reducedMotion>
          <Timeline orientation={orientation}>
            <Timeline.Stats>
              <Timeline.Stat label="Days" value="7" />
            </Timeline.Stats>
          </Timeline>
        </PanelUIProvider>
      );
      const label = screen.getByText("Days");
      expect(label.parentElement).toBe(screen.getByText("7").parentElement);
      const layout = getComputedStyle(label.parentElement as Element);
      expect(layout.display).toBe("flex");
      expect(layout.flexDirection).toBe("column");
    } finally {
      style.remove();
    }
  }
);

it("masthead stacks its source label and title in a column", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider>
        <Timeline.Masthead label="Built for" title="Learning journey" />
      </PanelUIProvider>
    );
    const label = screen.getByText("Built for");
    expect(label.parentElement).toBe(
      screen.getByText("Learning journey").parentElement
    );
    expect(getComputedStyle(label.parentElement as Element).display).toBe(
      "flex"
    );
    expect(getComputedStyle(label.parentElement as Element).flexDirection).toBe(
      "column"
    );
  } finally {
    style.remove();
  }
});
