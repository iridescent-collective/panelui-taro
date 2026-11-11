// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Marker } from "../src/components/Marker";
import { PanelUIProvider } from "../src/components/Provider";

it("decorative markers do not announce a button and preserve native view properties", () => {
  render(
    <PanelUIProvider>
      <Marker id="marker-note" aria-label="status" data-testid="marker">
        <Marker.Content>Explored 4 files</Marker.Content>
      </Marker>
    </PanelUIProvider>
  );
  expect(screen.queryByRole("button")).toBeNull();
  expect(screen.getByTestId("marker").id).toBe("marker-note");
  expect(screen.getByText("Explored 4 files").className).toContain(
    "panel-muted-foreground"
  );
});
it("interactive markers disable their callback and use the source opacity", () => {
  const press = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Marker onPress={press} disabled>
        <Marker.Content>Retry</Marker.Content>
      </Marker>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).not.toHaveBeenCalled();
  expect(screen.getByRole("button").className).toContain("opacity-[0.64]");
  tree.rerender(
    <PanelUIProvider>
      <Marker onPress={press}>
        <Marker.Content>Retry</Marker.Content>
      </Marker>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(press).toHaveBeenCalledOnce();
});
it("separator variant inserts two expanding rules and changes content typography", () => {
  const tree = render(
    <PanelUIProvider>
      <Marker variant="separator">
        <Marker.Content>Yesterday</Marker.Content>
      </Marker>
    </PanelUIProvider>
  );
  expect(tree.container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(
    2
  );
  expect(screen.getByText("Yesterday").className).toContain("uppercase");
  expect(screen.getByText("Yesterday").className).toContain("text-[24px]");
});
it("shimmer preserves source content classes and muted icon decoration", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Marker variant="border">
        <Marker.Icon data-testid="icon">✓</Marker.Icon>
        <Marker.Content shimmer>Working</Marker.Content>
      </Marker>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("icon").getAttribute("aria-hidden")).toBe("true");
  expect(screen.getByText("Working").className).toContain(
    "panel-muted-foreground"
  );
  expect(
    screen.getByText("Working").closest('[class*="border-b-"]')
  ).toBeTruthy();
});
