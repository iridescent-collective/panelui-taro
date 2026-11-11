// @vitest-environment happy-dom
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Task } from "../src/components/Task";
import { readTaroStyle } from "./taro-style";

it("tasks start expanded and completion does not auto-fold the record", async () => {
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Task status="running">
        <Task.Trigger title="Searching" />
        <Task.Content>
          <Task.Item>
            Read <Task.File>calendar.ts</Task.File>
          </Task.Item>
        </Task.Content>
      </Task>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("Read")).toBeTruthy();
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("Searching"))).toContain('"color"')
  );
  rerender(
    <PanelUIProvider reducedMotion>
      <Task status="complete">
        <Task.Trigger title="Searching" />
        <Task.Content>
          <Task.Item>
            Read <Task.File>calendar.ts</Task.File>
          </Task.Item>
        </Task.Content>
      </Task>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByText("calendar.ts").className).toContain("font-mono");
});
it("every status resolves its icon color from the default theme and error title uses the source tone", () => {
  const { container, rerender } = render(
    <PanelUIProvider>
      <Task status="complete">
        <Task.Trigger title="Done" />
      </Task>
    </PanelUIProvider>
  );
  const icon = () =>
    decodeURIComponent(
      container.querySelector("img")?.getAttribute("src") ?? ""
    );
  expect(icon()).toContain("#10b981");
  rerender(
    <PanelUIProvider>
      <Task status="error">
        <Task.Trigger title="Error" />
      </Task>
    </PanelUIProvider>
  );
  expect(icon()).toContain("#ef4444");
  expect(screen.getByText("Error").className).toContain(
    "text-[color:var(--panel-destructive)]"
  );
  rerender(
    <PanelUIProvider>
      <Task status="pending">
        <Task.Trigger title="Pending" />
      </Task>
    </PanelUIProvider>
  );
  expect(icon()).toContain("#686868");
  expect(screen.getByText("Pending").className).toContain(
    "--panel-muted-foreground-opacity-60"
  );
});
it("custom row and native click callbacks preserve controlled state requests", () => {
  const state = vi.fn();
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Task open={false} onOpenChange={state}>
        <Task.Trigger onClick={click}>Custom task</Task.Trigger>
      </Task>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(click).toHaveBeenCalledTimes(1);
  expect(state).toHaveBeenCalledWith(true);
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
    "false"
  );
});
const Probe = ({ mount }: { mount: () => void }) => {
  useEffect(mount, [mount]);
  return <span>kept</span>;
};
it("content survives folding and caller icons replace the derived glyph", () => {
  const mount = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Task>
        <Task.Trigger title="Step" icon={<span>custom icon</span>} />
        <Task.Content>
          <Probe mount={mount} />
        </Task.Content>
      </Task>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  fireEvent.click(screen.getByRole("button"));
  expect(mount).toHaveBeenCalledTimes(1);
  expect(screen.getByText("custom icon")).toBeTruthy();
});
