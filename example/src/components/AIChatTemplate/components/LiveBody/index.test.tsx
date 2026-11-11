// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import type { ChatTurn } from "../../type";
import { LiveBody } from "./index";
vi.mock("panelui-taro/task", () => ({
  Task: Object.assign(
    ({ status, children }: { status: string; children: ReactNode }) => (
      <div data-testid="tool" data-status={status}>
        {children}
      </div>
    ),
    {
      Trigger: ({ title }: { title: string }) => <span>{title}</span>,
      Content: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Item: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    }
  ),
}));
const turn: ChatTurn = {
  id: "a",
  role: "assistant",
  kind: "general",
  phase: "stopped",
  live: true,
  text: "",
  parts: [
    {
      type: "tool",
      id: "done",
      name: "Finished lookup",
      state: "output-available",
      output: "found",
    },
    {
      type: "tool",
      id: "pending",
      name: "Next lookup",
      state: "input-available",
      input: "{}",
    },
  ],
};
it("stops unfinished tool progress without relabeling completed tools", () => {
  render(<LiveBody turn={turn} />);
  expect(screen.getByText("Next lookup · Stopped")).toBeTruthy();
  expect(screen.getByText("Finished lookup")).toBeTruthy();
  expect(screen.queryByText("Finished lookup · Stopped")).toBeNull();
  expect(
    screen.getAllByTestId("tool").map((tool) => tool.dataset.status)
  ).toEqual(["complete", "pending"]);
  expect(screen.getAllByText("Response stopped")).toHaveLength(1);
});
it("shows unfinished tools as errors when a request fails", () => {
  render(<LiveBody turn={{ ...turn, phase: "error", error: "offline" }} />);
  expect(
    screen.getAllByTestId("tool").map((tool) => tool.dataset.status)
  ).toEqual(["complete", "error"]);
  expect(screen.getByRole("alert").textContent).toBe("offline");
});
