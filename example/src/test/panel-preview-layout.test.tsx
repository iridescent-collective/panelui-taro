// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { CircularTextShowcase } from "../components/CircularTextShowcase";
import { PreviewLayout } from "../components/PreviewLayout";

vi.mock("panelui-taro/circular-text", () => ({
  CircularText: ({ children }: { children?: ReactNode }) => (
    <div
      data-testid="circle-probe"
      data-whole-text={typeof children === "string" ? children : ""}
    />
  ),
}));
vi.mock("panelui-taro/button", () => ({
  Button: ({
    children,
    onPress,
  }: {
    children?: ReactNode;
    onPress?: () => void;
  }) => <button onClick={onPress}>{children}</button>,
}));

vi.mock("@tarojs/components", () => ({
  ScrollView: ({
    scrollY,
    style,
    children,
  }: {
    scrollY?: boolean;
    style?: ComponentProps<"div">["style"];
    children?: ReactNode;
  }) => (
    <div data-testid="native-scroller" data-scroll-y={scrollY} style={style}>
      {children}
    </div>
  ),
  View: ({
    children,
    className,
  }: {
    children?: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));
vi.mock("panelui-taro/provider", () => ({
  PanelUIProvider: ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  ),
}));
vi.mock("panelui-taro/typography", () => ({
  Typography: {
    Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    Paragraph: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
  },
}));
vi.mock("@/components/navigation/PageLayout", () => ({
  PageLayout: ({ children }: { children?: ReactNode }) => (
    <div style={{ height: 600, overflow: "hidden" }}>{children}</div>
  ),
}));

it("a long component gallery lives in a bounded native scroller inside the fixed page layout", () => {
  render(
    <PreviewLayout>
      <div style={{ height: 3000 }}>Last component</div>
    </PreviewLayout>
  );
  const scroller = screen.getByTestId("native-scroller");
  expect(scroller.dataset.scrollY).toBe("true");
  expect(scroller.style.height).toBe("100%");
  expect(scroller.contains(screen.getByText("Last component"))).toBe(true);
});

it("circular text preview passes one complete string rather than multiple JSX text children", () => {
  render(<CircularTextShowcase />);
  expect(screen.getByTestId("circle-probe").dataset.wholeText).toBe(
    "PANEL UI · 学习与成长 · "
  );
});
