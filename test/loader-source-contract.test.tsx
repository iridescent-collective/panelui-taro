// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, render, renderHook, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Loader } from "../src/components/Loader";
import type { LoaderVariant } from "../src/components/Loader";
import { ballAt, repeatValue } from "../src/components/Loader/geometry";
import { useLoaderClock } from "../src/components/Loader/use-clock";
import { PanelUIProvider } from "../src/components/Provider";
import { IconColorProvider } from "../src/icons/context";
import fixtures from "./fixtures/loader-source-static.json";
import { readTaroStyle } from "./taro-style";

interface SourceNode {
  type: string;
  props: {
    style?: Record<string, unknown> | Record<string, unknown>[];
    animatedProps?: Record<string, number | string>;
    children?: SourceNode[] | SourceNode[][];
    width?: number;
    height?: number;
  };
}
const nodes = (node: SourceNode): SourceNode[] => [
  node,
  ...(node.props.children ?? []).flat().flatMap(nodes),
];
const sourceNodes = (variant: LoaderVariant) =>
  nodes(fixtures[variant] as SourceNode);
const targetStyle = (element: Element) =>
  JSON.parse(readTaroStyle(element) ?? "{}") as Record<string, unknown>;
const dimensions = (value: unknown) =>
  typeof value === "number" ? `${value * 2}rpx` : value;
const firstLeaf = () => {
  const leaf = [
    ...screen.getByRole("progressbar").querySelectorAll("div"),
  ].find((node) => node.children.length === 0);
  if (!leaf) {
    throw new Error("Loader leaf is missing");
  }
  return leaf;
};
it.each([
  "pulse-dots",
  "bounce-dots",
  "pulsating-dots",
  "bar-cascade",
  "bouncing-bars",
  "symmetric-wave",
] as const)("%s reproduces pinned source static pieces", (variant) => {
  render(
    <PanelUIProvider reducedMotion>
      <Loader variant={variant} />
    </PanelUIProvider>
  );
  const root = screen.getByRole("progressbar");
  expect(root.getAttribute("aria-label")).toBe("Loading");
  const leaves = sourceNodes(variant).filter(
    (node) =>
      node.type === "View" &&
      node.props.style &&
      (node.props.children?.length ?? 0) === 0
  );
  const drawn = [...root.querySelectorAll("div")].filter(
    (node) => node.children.length === 0
  );
  expect(drawn).toHaveLength(leaves.length);
  for (const [index, node] of leaves.entries()) {
    const source = Object.assign(
      {},
      ...(Array.isArray(node.props.style)
        ? node.props.style
        : [node.props.style])
    );
    const actual = targetStyle(drawn[index]);
    for (const key of ["width", "height", "backgroundColor", "opacity"]) {
      if (source[key] === undefined) {
        continue;
      }
      const expected =
        key === "width" || key === "height"
          ? dimensions(source[key])
          : source[key];
      expect(actual[key]).toBe(expected);
    }
    const transform = source.transform as
      | {
          translateY?: number;
          scale?: number;
          scaleY?: number;
        }[]
      | undefined;
    for (const entry of transform ?? []) {
      for (const [key, value] of Object.entries(entry)) {
        expect(actual.transform).toContain(
          `${key}(${key === "translateY" ? dimensions(value) : value})`
        );
      }
    }
  }
});
it.each(["liquid-dots", "wave-physics"] as const)(
  "%s reproduces pinned source SVG paths",
  (variant) => {
    render(
      <PanelUIProvider reducedMotion>
        <Loader variant={variant} />
      </PanelUIProvider>
    );
    const image = screen.getByRole("progressbar").querySelector("img");
    expect(image).not.toBeNull();
    const markup = decodeURIComponent(
      image?.getAttribute("src")?.split(",")[1] ?? ""
    );
    for (const node of sourceNodes(variant)) {
      if (node.type === "Path") {
        expect(markup).toContain(`d="${node.props.animatedProps?.d}"`);
      }
      if (node.type !== "Ellipse") {
        continue;
      }
      for (const [key, value] of Object.entries(
        node.props.animatedProps ?? {}
      )) {
        expect(markup).toContain(`${key}="${value}"`);
      }
    }
  }
);
it("morph-ring reproduces its source still shape without enlarging the border box", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Loader variant="morph-ring" />
    </PanelUIProvider>
  );
  const style = targetStyle(firstLeaf());
  expect(style.width).toBe("68rpx");
  expect(Number(String(style.borderRadius).replace(/rpx$/u, ""))).toBeCloseTo(
    20.4
  );
  expect(style.transform).toBe("rotate(90deg)");
  expect(style.boxSizing).toBe("border-box");
});
it("source repeat timing honors delay, quadratic easing and reversed repeat", () => {
  expect(repeatValue(100, 200, 700, 0.2, 1)).toBe(0.2);
  expect(repeatValue(550, 200, 700, 0.2, 1)).toBeCloseTo(0.6);
  expect(repeatValue(900, 200, 700, 0.2, 1)).toBe(1);
  expect(repeatValue(1600, 200, 700, 0.2, 1)).toBe(0.2);
  expect(ballAt(0)).toEqual({ index: 0, lift: 0 });
  expect(ballAt(1)).toEqual({ index: 14, lift: 0 });
  expect(ballAt(1.5)).toEqual({ index: 7, lift: 0 });
});
it("color inherits a filled surface while an explicit theme token takes precedence", () => {
  const view = render(
    <PanelUIProvider reducedMotion>
      <IconColorProvider color="#fafafa">
        <Loader color="--color-primary" />
      </IconColorProvider>
    </PanelUIProvider>
  );
  let dot = firstLeaf();
  expect(targetStyle(dot).backgroundColor).toBe("#262626");
  view.rerender(
    <PanelUIProvider reducedMotion>
      <IconColorProvider color="#fafafa">
        <Loader />
      </IconColorProvider>
    </PanelUIProvider>
  );
  dot = firstLeaf();
  expect(targetStyle(dot).backgroundColor).toBe("#fafafa");
});
it("size scales the source geometry and stopped tempo creates no timer", () => {
  vi.useFakeTimers();
  try {
    render(
      <PanelUIProvider>
        <Loader variant="liquid-dots" size="lg" speed={0} />
      </PanelUIProvider>
    );
    const image = screen.getByRole("progressbar").querySelector("img");
    expect(readTaroStyle(image)).toContain("194.4rpx");
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("ordinary tempo restarts its source phase and unmount clears the animation clock", () => {
  vi.useFakeTimers();
  try {
    const view = render(
      <PanelUIProvider>
        <Loader />
      </PanelUIProvider>
    );
    expect(targetStyle(firstLeaf()).opacity).toBe(0.2);
    act(() => vi.advanceTimersByTime(352));
    expect(Number(targetStyle(firstLeaf()).opacity)).toBeCloseTo(0.6, 1);
    view.rerender(
      <PanelUIProvider>
        <Loader speed={2} />
      </PanelUIProvider>
    );
    expect(targetStyle(firstLeaf()).opacity).toBe(0.2);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("physics tempo changes accumulate without jumping and reduced motion renders its designed still frame", () => {
  vi.useFakeTimers();
  try {
    const view = render(
      <PanelUIProvider>
        <Loader variant="wave-physics" />
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(160));
    const before = screen
      .getByRole("progressbar")
      .querySelector("img")
      ?.getAttribute("src");
    view.rerender(
      <PanelUIProvider>
        <Loader variant="wave-physics" speed={2} />
      </PanelUIProvider>
    );
    expect(
      screen.getByRole("progressbar").querySelector("img")?.getAttribute("src")
    ).toBe(before);
    act(() => vi.advanceTimersByTime(16));
    expect(
      screen.getByRole("progressbar").querySelector("img")?.getAttribute("src")
    ).not.toBe(before);
    view.rerender(
      <PanelUIProvider reducedMotion>
        <Loader variant="wave-physics" speed={2} />
      </PanelUIProvider>
    );
    expect(vi.getTimerCount()).toBe(0);
    const image = screen.getByRole("progressbar").querySelector("img");
    expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
      'cx="58.5"'
    );
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it.each([
  "pulse-dots",
  "pulsating-dots",
  "bouncing-bars",
  "liquid-dots",
  "morph-ring",
] as const)(
  "%s size changes preserve the source animation phase",
  (variant) => {
    vi.useFakeTimers();
    try {
      const view = renderHook(
        ({ scale }) => useLoaderClock(true, 1, variant, scale),
        { initialProps: { scale: 1 } }
      );
      act(() => vi.advanceTimersByTime(352));
      expect(view.result.current).toBe(352);
      view.rerender({ scale: 1.35 });
      expect(view.result.current).toBe(352);
      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  }
);
it.each(["bounce-dots", "bar-cascade", "symmetric-wave"] as const)(
  "%s size changes restart source animations with new travel bounds",
  (variant) => {
    vi.useFakeTimers();
    try {
      const view = renderHook(
        ({ scale }) => useLoaderClock(true, 1, variant, scale),
        { initialProps: { scale: 1 } }
      );
      act(() => vi.advanceTimersByTime(352));
      view.rerender({ scale: 1.35 });
      expect(view.result.current).toBe(0);
      view.unmount();
    } finally {
      vi.useRealTimers();
    }
  }
);
