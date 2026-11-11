import { getWindowInfo } from "@tarojs/taro";
// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { Panelside } from "panelui-taro/panelside";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { ComponentPage } from "../components/docs/ComponentPage";
import { useSafeAreaInsets } from "../runtime/native";
import type { ComponentEntry } from "../types";

vi.hoisted(() => vi.resetModules());

vi.mock("../services/native-theme", () => ({ useNativeTheme: vi.fn() }));
vi.mock("../components/docs/DocsShell", () => ({
  DocsShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="docs-shell">{children}</div>
  ),
}));
vi.mock("@tarojs/taro", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tarojs/taro")>();
  return { ...actual, getWindowInfo: vi.fn(actual.getWindowInfo) };
});
vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tarojs/components")>();
  const { forwardRef } = await import("react");
  return {
    ...actual,
    View: forwardRef((props: Record<string, unknown>, ref) => (
      <actual.View
        {...props}
        ref={ref as never}
        data-test-style={JSON.stringify(props.style)}
      />
    )),
  };
});
const windowInfo = getWindowInfo();
afterEach(() => vi.mocked(getWindowInfo).mockReturnValue(windowInfo));

const entry: ComponentEntry = {
  slug: "panelside",
  name: "Panelside",
  summary: "Panel summary",
  demos: [
    {
      label: "Assistant",
      fullPage: true,
      fullBleed: true,
      description: "Demo description",
      render: () => <div>Panel demo</div>,
    },
  ],
};
it("opens full-bleed demos without docs chrome and allows returning and reopening", () => {
  render(<ComponentPage entry={entry} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Open full-screen preview" })
  );
  expect(screen.getByText("Panel demo")).toBeTruthy();
  expect(screen.queryByTestId("docs-shell")).toBeNull();
  expect(screen.queryByText("Demo description")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Back to examples" }));
  expect(screen.getByTestId("docs-shell")).toBeTruthy();
  expect(screen.getByText("Demo description")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Open full-screen preview" })
  );
  expect(screen.queryByTestId("docs-shell")).toBeNull();
});
it("retains the documentation for ordinary full-page demos", () => {
  render(
    <ComponentPage
      entry={{ ...entry, demos: [{ ...entry.demos[0], fullBleed: false }] }}
    />
  );
  expect(screen.getByTestId("docs-shell")).toBeTruthy();
  expect(screen.getByText("Demo description")).toBeTruthy();
});
const Insets = () => <output>{JSON.stringify(useSafeAreaInsets())}</output>;
it.each([96, 0])(
  "uses the same window-relative top inset with window origin %s",
  (screenTop) => {
    const original = getWindowInfo();
    const mockedWindow = {
      ...original,
      screenTop,
      safeArea: { ...original.safeArea!, top: 44 },
    };
    vi.mocked(getWindowInfo).mockReturnValue(mockedWindow);
    const { container, unmount } = render(
      <Panelside>
        <Panelside.Panel>
          <Panelside.Header title="Assistant" />
        </Panelside.Panel>
        <Panelside.Scene />
      </Panelside>
    );
    const header = screen.getByText("Assistant").closest("[data-test-style]");
    // The title's own wrapper has no inline style; the header owns the inset.
    const insetHeader = [
      ...container.querySelectorAll("[data-test-style]"),
    ].find((node) =>
      node.getAttribute("data-test-style")?.includes("paddingTop")
    );
    expect(header).toBeTruthy();
    expect(
      JSON.parse(insetHeader!.getAttribute("data-test-style")!).paddingTop
    ).toBe(`${(Math.max(0, 44 - screenTop) + 12) * 2}rpx`);
    unmount();
    render(<Insets />);
    expect(JSON.parse(screen.getByRole("status").textContent ?? "{}").top).toBe(
      Math.max(0, 44 - screenTop)
    );
  }
);
