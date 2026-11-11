// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { Field } from "../src/components/Field";
import { PanelUIProvider } from "../src/components/Provider";
import { Switch } from "../src/components/Switch";

it.each(["xs", "sm", "md", "lg", "xl"] as const)(
  "%s switch starts its thumb at the inline edge and centers it vertically like upstream Yoga",
  (size) => {
    const style = document.createElement("style");
    style.textContent =
      ".flex-row{flex-direction:row}.flex-col{flex-direction:column}.items-center{align-items:center}.items-start{align-items:flex-start}.justify-center{justify-content:center}";
    document.head.append(style);
    for (const dir of ["ltr", "rtl"] as const) {
      const { unmount } = render(
        <Direction dir={dir}>
          <Switch value={false} size={size} />
        </Direction>
      );
      const track = screen.getByRole("switch").lastElementChild;
      if (!(track instanceof HTMLElement)) {
        throw new Error("Missing switch track");
      }
      const layout = getComputedStyle(track);
      expect(layout.flexDirection).toBe("column");
      expect(layout.alignItems).toBe("flex-start");
      expect(layout.justifyContent).toBe("center");
      expect(track.style.direction).toBe(dir);
      unmount();
    }
    style.remove();
  }
);

it("controlled switches report changes without optimistically moving the thumb", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Switch value={false} onValueChange={change} label="提醒" />
  );
  fireEvent.click(screen.getByRole("switch"));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("false");
  rerender(<Switch value onValueChange={change} label="提醒" />);
  expect(screen.getByRole("switch").getAttribute("aria-checked")).toBe("true");
});
it("native switch rolls back an optimistic native toggle when its controlled parent rejects it", async () => {
  const change = vi.fn();
  render(<Switch native value={false} onValueChange={change} />);
  fireEvent.click(screen.getByRole("switch"));
  expect(change).toHaveBeenCalledWith(true);
  await waitFor(() => {
    expect((screen.getByRole("switch") as HTMLInputElement).checked).toBe(
      false
    );
  });
});
it("all five sizes retain exact upstream travel and RTL mirrors the thumb", () => {
  const travel = { lg: 24, md: 20, sm: 16, xl: 28, xs: 12 } as const;
  for (const [size, amount] of Object.entries(travel)) {
    const { unmount } = render(
      <Direction dir="rtl">
        <Switch value size={size as keyof typeof travel} />
      </Direction>
    );
    const thumb = screen.getByRole("switch").lastElementChild?.lastElementChild;
    expect(thumb?.getAttribute("style")).toContain(
      `translateX(${-amount * 2}rpx)`
    );
    unmount();
  }
});
it("inherits Field relationships, explicit label wins, and disabled suppresses clicks", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Field>
      <Field.Title>通知</Field.Title>
      <Switch value={false} disabled onValueChange={change} />
    </Field>
  );
  expect(screen.getByRole("switch").getAttribute("aria-labelledby")).toContain(
    screen.getByText("通知").id
  );
  fireEvent.click(screen.getByRole("switch"));
  expect(change).not.toHaveBeenCalled();
  rerender(
    <Field>
      <Switch value label="通知" />
    </Field>
  );
  expect(screen.getByRole("switch").getAttribute("aria-labelledby")).toBeNull();
});
it("native mode emits actual platform value, and reduced motion skips custom transitions", () => {
  const change = vi.fn();
  const { rerender } = render(
    <Switch native value={false} onValueChange={change} label="原生" />
  );
  fireEvent.click(screen.getByRole("switch"));
  expect(change).toHaveBeenCalledWith(true);
  rerender(
    <PanelUIProvider reducedMotion>
      <Switch value />
    </PanelUIProvider>
  );
  expect(
    screen
      .getByRole("switch")
      .lastElementChild?.lastElementChild?.getAttribute("style")
  ).toContain("transition: none");
});
