// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState, useSyncExternalStore } from "react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { Direction } from "../src/components/Direction";
import { Panelside, usePanelside } from "../src/components/Panelside";
import {
  panelsidePanel,
  panelsideRelease,
  panelsideScene,
} from "../src/components/Panelside/math";
import { PanelUIProvider } from "../src/components/Provider";
import fixtures from "./fixtures/panelside-source.json";
import {
  setTestMeasurement,
  setElementMeasurement,
  setElementComputedStyle,
} from "./taro-api";

const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>{`Count ${count}`}</button>
  );
};

const footerSample = (floating: boolean) => (
  <PanelUIProvider reducedMotion>
    <Panelside defaultOpen>
      <Panelside.Panel>
        <Panelside.Content>
          <Panelside.GroupLabel>Recent</Panelside.GroupLabel>
          <Panelside.Item label="Reading" />
        </Panelside.Content>
        <Panelside.Footer id="foot" floating={floating} surface="fade">
          <Panelside.Cta label="New chat" />
        </Panelside.Footer>
      </Panelside.Panel>
      <Panelside.Scene />
    </Panelside>
  </PanelUIProvider>
);

const Reading = () => {
  const context = usePanelside();
  const progress = useSyncExternalStore(
    context.progress.subscribe,
    context.progress.getSnapshot,
    context.progress.getSnapshot
  );
  return (
    <span data-testid="state">
      {JSON.stringify({
        docked: context.docked,
        open: context.open,
        progress,
        route: context.route,
      })}
    </span>
  );
};
const point = (x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
it("moves the closed RTL overlay beyond its anchored right edge", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Panelside mode="overlay" width={300}>
          <Panelside.Panel id="rtl-overlay-panel">Navigation</Panelside.Panel>
          <Panelside.Scene>Scene</Panelside.Scene>
        </Panelside>
      </Direction>
    </PanelUIProvider>
  );
  const panel = container.querySelector("#rtl-overlay-panel");
  expect(panel).toBeTruthy();
  expect((panel as HTMLElement).style.right).toBe("0px");
  expect((panel as HTMLElement).style.transform).toBe("translateX(600rpx)");
});
it("source navigation closes, active rows derive from route and pages keep state after first visit", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Panelside defaultOpen defaultRoute="one">
        <Panelside.Panel>
          <Panelside.Content>
            <Panelside.Item label="One" to="one" />
            <Panelside.Item label="Two" to="two" />
          </Panelside.Content>
        </Panelside.Panel>
        <Panelside.Scene>
          <Panelside.Trigger />
          <Panelside.Pages>
            <Panelside.Page value="one">
              <Counter />
            </Panelside.Page>
            <Panelside.Page value="two">Second page</Panelside.Page>
          </Panelside.Pages>
        </Panelside.Scene>
        <Reading />
      </Panelside>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Two" }));
  expect(screen.getByText("Second page")).toBeTruthy();
  expect(screen.getByTestId("state").textContent).toContain('"open":false');
  fireEvent.click(
    screen.getByRole("button", { name: "Open navigation panel" })
  );
  fireEvent.click(screen.getByRole("button", { name: "One" }));
  fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
  expect(screen.getByRole("button", { name: "Count 1" })).toBeTruthy();
});
it("native row click and nested action click compose without bypassing navigation or selecting the underlying row", () => {
  const click = vi.fn();
  const action = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Panelside defaultOpen defaultRoute="one">
        <Panelside.Panel>
          <Panelside.Item label="Go" to="two" onClick={click}>
            <Panelside.Action label="Options" onClick={action} />
          </Panelside.Item>
        </Panelside.Panel>
        <Panelside.Scene />
        <Reading />
      </Panelside>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Options" }));
  expect(action).toHaveBeenCalledTimes(1);
  expect(click).not.toHaveBeenCalled();
  expect(screen.getByTestId("state").textContent).toContain('"route":"one"');
  fireEvent.click(screen.getByRole("button", { name: "Go" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("state").textContent).toContain('"route":"two"');
});
it("native custom trigger composes its existing handler with the panel toggle", () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Panelside>
        <Panelside.Panel />
        <Panelside.Scene>
          <Panelside.Trigger>
            <Button onClick={click}>Custom open</Button>
          </Panelside.Trigger>
        </Panelside.Scene>
        <Reading />
      </Panelside>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Custom open" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("state").textContent).toContain('"open":true');
});
it("a controlled rejected drag restores the controlled closed position", async () => {
  setTestMeasurement(375, 375);
  const change = vi.fn();
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Panelside open={false} onOpenChange={change}>
        <Panelside.Panel />
        <Panelside.Scene />
        <Reading />
      </Panelside>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const root = container.querySelector<HTMLElement>("[data-taro-catch-move]");
  if (!root) {
    throw new Error("Panelside root missing");
  }
  fireEvent.touchStart(root, { touches: [point(10, 40)] });
  fireEvent.touchMove(root, { touches: [point(200, 40)] });
  fireEvent.touchEnd(root, { changedTouches: [point(200, 40)] });
  await act(async () => {
    await Promise.resolve();
  });
  expect(change).toHaveBeenLastCalledWith(true);
  expect(
    JSON.parse(screen.getByTestId("state").textContent ?? "{}").progress
  ).toBe(0);
});
for (const [index, fixture] of fixtures.scenes.entries()) {
  it(`source scene frame ${index}`, () => {
    const geometry = panelsideScene(
      fixture.p,
      fixture.pushes,
      fixture.scale,
      300,
      fixture.sceneWidth,
      fixture.sign,
      44
    );
    expect(geometry.radius).toBe(fixture.result.radius);
    expect(geometry.scale).toBe(fixture.result.scale);
    expect(geometry.x).toBeCloseTo(fixture.result.x, 12);
  });
}
for (const [index, fixture] of fixtures.panels.entries()) {
  it(`source panel frame ${index}`, () => {
    expect(
      panelsidePanel(fixture.p, fixture.docked, fixture.mode === "overlay", 300)
        .x
    ).toBeCloseTo(fixture.x, 12);
  });
}
for (const [index, fixture] of fixtures.releases.entries()) {
  it(`source release callback ${index}`, () => {
    expect(
      panelsideRelease(
        fixture.translation,
        fixture.velocity,
        fixture.sign,
        fixture.open
      )
    ).toBe(fixture.next);
  });
}
it("scene uses unscaled computed width for centre correction and root geometry is mirrored in RTL", async () => {
  setTestMeasurement(375, 375);
  setElementComputedStyle("scene", { width: "375px" });
  setElementMeasurement("scene", {
    height: 600,
    left: 0,
    top: 0,
    width: 337.5,
  });
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Direction dir="rtl">
        <Panelside defaultOpen width={300} scale={0.9}>
          <Panelside.Panel />
          <Panelside.Scene id="scene" />
          <Reading />
        </Panelside>
      </Direction>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(container.querySelector<HTMLElement>("#scene")?.style.transform).toBe(
    "translateX(-586.5rpx) scale(0.9)"
  );
});
it("docked panel is permanent, has narrower width and removes the trigger; overlay keeps the scene still", async () => {
  setTestMeasurement(375, 375);
  const { container, rerender } = render(
    <PanelUIProvider reducedMotion>
      <Panelside dock={300}>
        <Panelside.Panel id="panel" />
        <Panelside.Scene id="scene">
          <Panelside.Trigger />
        </Panelside.Scene>
        <Reading />
      </Panelside>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    screen.queryByRole("button", { name: "Open navigation panel" })
  ).toBeNull();
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>("#panel")?.dataset.taroStyle ?? "{}"
    ).width
  ).toBe("240rpx");
  rerender(
    <PanelUIProvider reducedMotion>
      <Panelside mode="overlay" defaultOpen>
        <Panelside.Panel id="panel" />
        <Panelside.Scene id="scene" />
      </Panelside>
    </PanelUIProvider>
  );
  expect(container.querySelector<HTMLElement>("#scene")?.style.transform).toBe(
    "translateX(0rpx) scale(1)"
  );
});
it("floating footer reserves exactly its measured height and stops reserving it when switched into flow", async () => {
  setElementMeasurement("foot", { height: 80, left: 0, top: 0, width: 300 });
  const { container, rerender } = render(footerSample(true));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    [...container.querySelectorAll<HTMLElement>("[data-taro-style]")].some(
      (node) => node.dataset.taroStyle?.includes('"paddingBottom":"184rpx"')
    )
  ).toBe(true);
  rerender(footerSample(false));
  await act(async () => {
    await Promise.resolve();
  });
  expect(
    [...container.querySelectorAll<HTMLElement>("[data-taro-style]")].some(
      (node) => node.dataset.taroStyle?.includes('"paddingBottom":"184rpx"')
    )
  ).toBe(false);
});
it("optional item press callbacks work outside the shell", () => {
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Panelside.Item label="Standalone" onPress={press} badge={2} />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Standalone" }));
  expect(press).toHaveBeenCalledTimes(1);
});

it("keepAlive false unmounts inactive page state and revisiting starts fresh", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Panelside defaultRoute="one">
        <Panelside.Pages>
          <Panelside.Page value="one" keepAlive={false}>
            <Counter />
          </Panelside.Page>
          <Panelside.Page value="two">Second</Panelside.Page>
        </Panelside.Pages>
        <Panelside.Item label="One" to="one" />
        <Panelside.Item label="Two" to="two" />
      </Panelside>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
  expect(screen.getByRole("button", { name: "Count 1" })).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Two" }));
  expect(
    screen.queryByRole("button", { hidden: true, name: "Count 1" })
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "One" }));
  expect(screen.getByRole("button", { name: "Count 0" })).toBeTruthy();
});

it("preserves the source column alignment for grouped content", () => {
  const style = document.createElement("style");
  style.textContent = ".flex{display:flex}.flex-col{flex-direction:column}";
  document.head.append(style);
  try {
    render(
      <Panelside.Group>
        <span>First</span>
        <span>Second</span>
      </Panelside.Group>
    );
    const parent = screen.getByText("First").parentElement as Element;
    expect(getComputedStyle(parent).display).toBe("flex");
    expect(getComputedStyle(parent).flexDirection).toBe("column");
  } finally {
    style.remove();
  }
});
