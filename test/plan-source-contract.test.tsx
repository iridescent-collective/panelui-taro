// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Plan } from "../src/components/Plan";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

it("steps count completed and skipped states and update progress without a repeated total", () => {
  const tree = render(
    <PanelUIProvider>
      <Plan>
        <Plan.Header>
          <Plan.Title>Prepare lessons</Plan.Title>
          <Plan.Action>
            <Plan.Progress />
          </Plan.Action>
        </Plan.Header>
        <Plan.Content>
          <Plan.Steps>
            <Plan.Step status="done">Read</Plan.Step>
            <Plan.Step status="skipped">Skip</Plan.Step>
            <Plan.Step status="active">Index</Plan.Step>
            <Plan.Step>Verify</Plan.Step>
          </Plan.Steps>
        </Plan.Content>
      </Plan>
    </PanelUIProvider>
  );
  expect(screen.getByText("2 of 4")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  expect(tree.container.querySelectorAll("[data-plan-connector]")).toHaveLength(
    3
  );
  tree.rerender(
    <PanelUIProvider>
      <Plan>
        <Plan.Progress />
        <Plan.Steps>
          <Plan.Step status="done">Read</Plan.Step>
          <Plan.Step status="done">Index</Plan.Step>
        </Plan.Steps>
      </Plan>
    </PanelUIProvider>
  );
  expect(screen.getByText("2 of 2")).toBeTruthy();
});
it("default body stays mounted while collapsing and the native callback executes once", () => {
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Plan>
        <Plan.Trigger onClick={press} />
        <Plan.Content data-testid="content">
          <Plan.Steps>
            <Plan.Step>Read</Plan.Step>
          </Plan.Steps>
        </Plan.Content>
      </Plan>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Collapse plan" }));
  expect(press).toHaveBeenCalledOnce();
  expect(screen.getByTestId("content").getAttribute("aria-hidden")).toBe(
    "true"
  );
  expect(screen.getByText("Read")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Expand plan" }));
  expect(screen.getByTestId("content").getAttribute("aria-hidden")).toBe(
    "false"
  );
});
it("controlled refusal keeps the body closed and explicit progress overrides counts", () => {
  const open = vi.fn();
  render(
    <PanelUIProvider>
      <Plan open={false} onOpenChange={open}>
        <Plan.Trigger />
        <Plan.Progress value={5} total={8} />
        <Plan.Content>
          <Plan.Steps>
            <Plan.Step>Read</Plan.Step>
          </Plan.Steps>
        </Plan.Content>
      </Plan>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Expand plan" }));
  expect(open).toHaveBeenCalledWith(true);
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
    "false"
  );
  expect(screen.getByText("5 of 8")).toBeTruthy();
});
it("no rail produces no progress and header extracts icon and action around the heading", () => {
  render(
    <PanelUIProvider>
      <Plan>
        <Plan.Header data-testid="header">
          <Plan.Title>Plan</Plan.Title>
          <Plan.Action data-testid="actions">
            <Plan.Trigger />
          </Plan.Action>
          <Plan.Description>Notes</Plan.Description>
          <Plan.Icon data-testid="icon">★</Plan.Icon>
        </Plan.Header>
        <Plan.Progress />
      </Plan>
    </PanelUIProvider>
  );
  const header = screen.getByTestId("header");
  expect(header.firstElementChild).toBe(screen.getByTestId("icon"));
  expect(header.lastElementChild).toBe(screen.getByTestId("actions"));
  expect(screen.getByRole("heading").parentElement?.textContent).toBe(
    "PlanNotes"
  );
  expect(screen.queryByText("0 of 0")).toBeNull();
});
it("step status controls the rail, skipped styling, descriptions and explicit last overrides", () => {
  const tree = render(
    <PanelUIProvider>
      <Plan>
        <Plan.Steps>
          <Plan.Step status="done" data-testid="done" last>
            Read
          </Plan.Step>
          <Plan.Step status="active" description="Build index" meta="math.pdf">
            Index
          </Plan.Step>
          <Plan.Step status="skipped" data-testid="skipped">
            Skipped
          </Plan.Step>
        </Plan.Steps>
      </Plan>
    </PanelUIProvider>
  );
  expect(screen.getByText("Skipped").className).toContain("line-through");
  expect(screen.getByText("math.pdf").className).toContain("font-mono");
  expect(screen.getByText("Build index").className).toContain(
    "panel-muted-foreground"
  );
  expect(
    screen.getByTestId("done").querySelector("[data-plan-connector]")
  ).toBeNull();
  expect(tree.container.querySelectorAll("[data-plan-connector]")).toHaveLength(
    1
  );
});
it("streaming affects only the active string step and preserves heading semantics", async () => {
  render(
    <PanelUIProvider>
      <Plan isStreaming>
        <Plan.Title>Writing plan</Plan.Title>
        <Plan.Description>Arriving</Plan.Description>
        <Plan.Steps>
          <Plan.Step status="active">Running</Plan.Step>
          <Plan.Step status="done">Finished</Plan.Step>
        </Plan.Steps>
      </Plan>
    </PanelUIProvider>
  );
  expect(screen.getByRole("heading", { name: "Writing plan" })).toBeTruthy();
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("Running"))).toContain("animation")
  );
  expect(readTaroStyle(screen.getByText("Finished"))).not.toContain(
    "animation"
  );
});
it("footer stretches each element or keeps end actions intrinsic", () => {
  const tree = render(
    <PanelUIProvider>
      <Plan>
        <Plan.Footer data-testid="footer">
          <button>Revise</button>
          <button>Approve</button>
        </Plan.Footer>
      </Plan>
    </PanelUIProvider>
  );
  expect(
    screen.getByRole("button", { name: "Approve" }).parentElement?.className
  ).toContain("flex-1");
  tree.rerender(
    <PanelUIProvider>
      <Plan>
        <Plan.Footer layout="end" data-testid="footer">
          <button>Approve</button>
        </Plan.Footer>
      </Plan>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button", { name: "Approve" }).parentElement).toBe(
    screen.getByTestId("footer")
  );
  expect(screen.getByTestId("footer").className).toContain("justify-end");
});
