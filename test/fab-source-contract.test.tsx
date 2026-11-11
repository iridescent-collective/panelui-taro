// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Fab } from "../src/components/Fab";
import type {
  FabMenuAppearance,
  FabPlacement,
  FabSize,
} from "../src/components/Fab";
import {
  fabMenuOrigin,
  fabMenuScale,
  fabSettled,
  fabSlotProgress,
} from "../src/components/Fab/math";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/fab-source.json";

it.each(FIXTURES.slots)(
  "matches pinned source slot $count/$index at $progress",
  ({ count, index, progress, output, settled }) => {
    expect(fabSlotProgress(progress, count, index)).toBeCloseTo(output, 10);
    expect(fabSettled(output)).toBeCloseTo(settled, 10);
  }
);
it.each(FIXTURES.origins)(
  "matches pinned source origin $placement/$appearance/$size/$count",
  ({ placement, appearance, size, count, width, output }) => {
    expect(
      fabMenuOrigin(
        placement as FabPlacement,
        appearance as FabMenuAppearance,
        width,
        count,
        size as FabSize
      )
    ).toBe(`${output[0] * 2}rpx ${output[1] * 2}rpx`);
  }
);
it("opens and closes a dial with no portal and closes before running an action", () => {
  const events: string[] = [];
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Fab.Group
        accessibilityLabel="Add"
        onOpenChange={(open) => events.push(String(open))}
      >
        <Fab.Action label="Photo" onPress={() => events.push("photo")} />
        <Fab.Action
          label="Disabled"
          disabled
          onPress={() => events.push("disabled")}
        />
      </Fab.Group>
    </PanelUIProvider>
  );
  expect(screen.queryByRole("button", { name: "Photo" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(container.querySelectorAll("[aria-label='Close']")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
  expect(events).toEqual(["true"]);
  fireEvent.click(screen.getByRole("button", { name: "Photo" }));
  expect(events).toEqual(["true", "false", "false", "photo"]);
  expect(screen.queryByRole("button", { name: "Photo" })).toBeNull();
});
it("supports controlled state, native menu fallback, glass fallback, menu icon placement and extended label", () => {
  const change = vi.fn();
  const press = vi.fn();
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Fab.Group
        layout="native"
        glass
        open
        accessibilityLabel="Add"
        onOpenChange={change}
      >
        <Fab.Action label="Remove" destructive onPress={press} />
      </Fab.Group>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(change).toHaveBeenLastCalledWith(false);
  expect(press).toHaveBeenCalledOnce();
  expect(screen.getByRole("button", { name: "Remove" })).toBeTruthy();
  rerender(
    <PanelUIProvider reducedMotion>
      <Fab extended glass accessibilityLabel="Write">
        Write
      </Fab>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button", { name: "Write" }).className).toContain(
    "bg-[var(--panel-primary)]"
  );
  expect(screen.getByText("Write")).toBeTruthy();
  expect(fabMenuScale(0)).toBe(0);
  expect(fabMenuScale(0.06)).toBe(0.3);
  expect(fabMenuScale(1.1)).toBe(1);
});
it("closes ordinary Fab children as well as Fab.Action and protects disabled root native clicks", () => {
  const press = vi.fn();
  const disabled = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Fab.Group open accessibilityLabel="Add">
        <Fab accessibilityLabel="Plain" onPress={press} />
      </Fab.Group>
      <Fab accessibilityLabel="Disabled" disabled onClick={disabled} />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Plain" }));
  expect(press).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
  expect(disabled).not.toHaveBeenCalled();
});
