// @vitest-environment happy-dom
import { act, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { AnimatedBadge } from "../src/components/AnimatedBadge";
import { Roll } from "../src/components/AnimatedBadge/roll";
import { useBadgeWidth } from "../src/components/AnimatedBadge/use-width";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementComputedStyle, setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const WidthProbe = ({
  changed,
  labelClassName,
}: {
  changed: boolean;
  labelClassName?: string;
}) => {
  const layout = useBadgeWidth(
    "width-probe",
    { children: "Label", labelClassName },
    changed ? "success" : "neutral",
    "Label",
    false
  );
  return (
    <div id="width-probe" data-testid="probe" data-width={layout.width}>
      <div id={layout.contentId} className={labelClassName}>
        Label
      </div>
    </div>
  );
};
it("an armed badge remeasures when only its label class changes", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("width-probe-content", {
      height: 20,
      left: 0,
      top: 0,
      width: 40,
    });
    const tree = render(<WidthProbe changed={false} />);
    await act(async () => {
      await Promise.resolve();
    });
    tree.rerender(<WidthProbe changed />);
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("probe").dataset.width).toBe("40");
    setElementMeasurement("width-probe-content", {
      height: 26,
      left: 0,
      top: 0,
      width: 100,
    });
    tree.rerender(<WidthProbe changed labelClassName="text-[36px]" />);
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("probe").dataset.width).toBe("100");
  } finally {
    vi.useRealTimers();
  }
});
it("all statuses preserve source tint and busy semantics while reduced motion suppresses pulse", () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <AnimatedBadge status="neutral" data-testid="badge">
        Ready
      </AnimatedBadge>
    </PanelUIProvider>
  );
  for (const status of [
    "neutral",
    "info",
    "success",
    "warning",
    "danger",
    "loading",
  ] as const) {
    tree.rerender(
      <PanelUIProvider reducedMotion>
        <AnimatedBadge status={status} data-testid="badge">
          Ready
        </AnimatedBadge>
      </PanelUIProvider>
    );
    expect(screen.getByTestId("badge").getAttribute("aria-busy")).toBe(
      String(status === "loading")
    );
    expect(screen.getByTestId("badge").getAttribute("aria-label")).toBe(
      "Ready"
    );
    expect(
      tree.container.querySelector('[style*="panel-badge-pulse"]')
    ).toBeNull();
  }
});
it("roll carries one old label out and commits the newest pending label after the exit", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <Roll contentKey="old" reducedMotion={false}>
        Old
      </Roll>
    );
    tree.rerender(
      <Roll contentKey="next" reducedMotion={false}>
        Next
      </Roll>
    );
    expect(screen.getByText("Old")).toBeTruthy();
    expect(screen.queryByText("Next")).toBeNull();
    act(() => vi.advanceTimersByTime(90));
    tree.rerender(
      <Roll contentKey="latest" reducedMotion={false}>
        Latest
      </Roll>
    );
    act(() => vi.advanceTimersByTime(180));
    expect(screen.getByText("Latest")).toBeTruthy();
    expect(screen.queryByText("Old")).toBeNull();
    expect(screen.queryByText("Next")).toBeNull();
    act(() => vi.advanceTimersByTime(2000));
    expect(readTaroStyle(screen.getByText("Latest"))).toContain(
      "translateY(0%)"
    );
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("changing back during the exit restores the original slot instead of leaving it outside the badge", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <Roll contentKey="old" reducedMotion={false}>
        Old
      </Roll>
    );
    tree.rerender(
      <Roll contentKey="next" reducedMotion={false}>
        Next
      </Roll>
    );
    act(() => vi.advanceTimersByTime(90));
    tree.rerender(
      <Roll contentKey="old" reducedMotion={false}>
        Old
      </Roll>
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.queryByText("Next")).toBeNull();
    expect(readTaroStyle(screen.getByText("Old"))).toContain('"opacity":1');
  } finally {
    vi.useRealTimers();
  }
});
it("same keys update content without rolling and reduced-motion transitions swap immediately", () => {
  const tree = render(
    <Roll contentKey="stable" reducedMotion={false}>
      A
    </Roll>
  );
  tree.rerender(
    <Roll contentKey="stable" reducedMotion={false}>
      B
    </Roll>
  );
  expect(screen.getByText("B")).toBeTruthy();
  tree.rerender(
    <Roll contentKey="new" reducedMotion>
      C
    </Roll>
  );
  expect(screen.getByText("C")).toBeTruthy();
  expect(readTaroStyle(screen.getByText("C"))).toContain('"opacity":1');
});
it("layout is armed only after a real change and uses measured content plus actual padding", async () => {
  vi.useFakeTimers();
  try {
    setElementComputedStyle("badge-width", {
      "padding-left": "12px",
      "padding-right": "12px",
    });
    setElementMeasurement("badge-width-content", {
      height: 20,
      left: 0,
      top: 0,
      width: 40,
    });
    const tree = render(
      <PanelUIProvider>
        <AnimatedBadge id="badge-width" data-testid="badge">
          A
        </AnimatedBadge>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(readTaroStyle(screen.getByTestId("badge"))).toBe("{}");
    setElementMeasurement("badge-width-content", {
      height: 20,
      left: 0,
      top: 0,
      width: 100,
    });
    tree.rerender(
      <PanelUIProvider>
        <AnimatedBadge id="badge-width" data-testid="badge">
          Longer
        </AnimatedBadge>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2500));
    expect(readTaroStyle(screen.getByTestId("badge"))).toContain(
      '"width":"248rpx"'
    );
    setElementMeasurement("badge-width-content", {
      height: 26,
      left: 0,
      top: 0,
      width: 130,
    });
    tree.rerender(
      <PanelUIProvider>
        <AnimatedBadge
          id="badge-width"
          data-testid="badge"
          labelClassName="text-[36px]"
        >
          Longer
        </AnimatedBadge>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2500));
    expect(readTaroStyle(screen.getByTestId("badge"))).toContain(
      '"width":"308rpx"'
    );
    tree.rerender(
      <PanelUIProvider>
        <AnimatedBadge
          id="badge-width"
          data-testid="badge"
          animateLayout={false}
        >
          No layout
        </AnimatedBadge>
      </PanelUIProvider>
    );
    expect(readTaroStyle(screen.getByTestId("badge"))).toBe("{}");
  } finally {
    vi.useRealTimers();
  }
});
it("hidden icon and boolean children do not allocate empty slots; explicit pulse works on other statuses", () => {
  const tree = render(
    <PanelUIProvider>
      <AnimatedBadge showIcon={false} pulse data-testid="badge">
        {false}
      </AnimatedBadge>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("badge").querySelectorAll("img")).toHaveLength(0);
  expect(
    tree.container.querySelector('[style*="panel-badge-pulse"]')
  ).toBeTruthy();
  expect(screen.getByTestId("badge").getAttribute("aria-label")).toBeNull();
});

it("roll centers image and text children without an inline baseline", () => {
  render(
    <Roll contentKey="icon" reducedMotion={false}>
      <img alt="glyph" />
    </Roll>
  );
  expect(screen.getByAltText("glyph").parentElement?.className).toContain(
    "flex"
  );
  expect(screen.getByAltText("glyph").parentElement?.className).toContain(
    "items-center"
  );
});
