// @vitest-environment happy-dom
import { navigateTo } from "@tarojs/taro";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { DocsShell } from "../components/docs/DocsShell";

vi.mock("../services/native-theme", () => ({ useNativeTheme: vi.fn() }));
vi.mock("../components/docs/ThemeControl", () => ({
  ThemeControl: () => null,
}));
vi.mock("panelui-taro/bottom-sheet", () => ({
  BottomSheet: Object.assign(
    ({
      open,
      children,
      onOpenChange,
    }: {
      open: boolean;
      children: ReactNode;
      onOpenChange: (open: boolean) => void;
    }) =>
      open ? (
        <div>
          <button onClick={() => onOpenChange(false)}>Close directory</button>
          {children}
        </div>
      ) : null,
    {
      Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Header: () => null,
      Body: ({
        children,
        scrollIntoView,
        scrollTop,
      }: {
        children: ReactNode;
        scrollIntoView?: string;
        scrollTop?: number;
      }) => (
        <div
          data-testid="directory-list"
          data-target={scrollIntoView}
          data-top={scrollTop}
        >
          {children}
        </div>
      ),
    }
  ),
}));

it("targets the selected Fab on every open and resets positioning while searching", () => {
  render(
    <DocsShell section="components" slug="fab">
      <div>Demo</div>
    </DocsShell>
  );
  const open = () =>
    fireEvent.click(screen.getByRole("button", { name: "Browse components" }));
  open();
  const target = screen.getByRole("button", { name: "Fab" });
  expect(target.id).toBeTruthy();
  expect(screen.getByTestId("directory-list").dataset.target).toBe(target.id);
  fireEvent.click(screen.getByRole("button", { name: "Close directory" }));
  open();
  expect(screen.getByTestId("directory-list").dataset.target).toBe(target.id);
  fireEvent.input(screen.getByPlaceholderText("Search components…"), {
    target: { value: "badge" },
  });
  expect(screen.getByTestId("directory-list").dataset.target).toBe("");
  expect(screen.getByTestId("directory-list").dataset.top).toBe("0");
  fireEvent.input(screen.getByPlaceholderText("Search components…"), {
    target: { value: "" },
  });
  expect(screen.getByTestId("directory-list").dataset.target).toBe(target.id);
});

it("opens the AI Assistant from the actual example navigation", () => {
  render(<DocsShell section="components" slug="accordion"><div>Demo</div></DocsShell>);
  fireEvent.click(screen.getByRole("button", { name: "Open AI Assistant" }));
  expect(navigateTo).toHaveBeenCalledWith({ url: "/showcases/ai/index" });
});
