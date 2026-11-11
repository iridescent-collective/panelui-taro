// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import type { InputHandle } from "../src/components/Input/types";
import { OtpInput } from "../src/components/OtpInput";
import {
  normalizeOtpLength,
  resolveOtpEditable,
  sanitizeOtp,
} from "../src/components/OtpInput/state";
import { PanelUIProvider } from "../src/components/Provider";

it("source filtering trims numeric input and keeps text mode and editable precedence", () => {
  expect(sanitizeOtp("a1 2🙂3-4567", 6, "numeric")).toBe("123456");
  expect(sanitizeOtp("AB cd", 4, "text")).toBe("AB c");
  expect(resolveOtpEditable(true, true)).toBe(false);
  expect(resolveOtpEditable(false, false)).toBe(false);
  expect(normalizeOtpLength(Number.NaN)).toBe(6);
  expect(normalizeOtpLength(-3)).toBe(0);
});
it("uses one real input and completes once until the value becomes partial again", async () => {
  const complete = vi.fn();
  const change = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <OtpInput
        accessibilityLabel="Code"
        length={4}
        onComplete={complete}
        onChangeText={change}
      />
    </PanelUIProvider>
  );
  const input = screen.getByLabelText("Code") as HTMLInputElement;
  expect(tree.container.querySelectorAll("input")).toHaveLength(1);
  fireEvent.input(input, { target: { value: "123456" } });
  await act(async () => {
    await Promise.resolve();
  });
  expect(change).toHaveBeenCalledWith("1234");
  expect(complete).toHaveBeenCalledExactlyOnceWith("1234");
  expect(input.value).toBe("1234");
  fireEvent.input(input, { target: { value: "9876" } });
  await act(async () => {
    await Promise.resolve();
  });
  expect(complete).toHaveBeenCalledTimes(1);
  fireEvent.input(input, { target: { value: "98" } });
  await act(async () => {
    await Promise.resolve();
  });
  fireEvent.input(input, { target: { value: "9876" } });
  await act(async () => {
    await Promise.resolve();
  });
  expect(complete).toHaveBeenCalledTimes(2);
});
it("controlled refusals restore native value without remounting or firing external prop completion", async () => {
  const complete = vi.fn();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <OtpInput
        accessibilityLabel="Code"
        type="text"
        length={4}
        value="A"
        onChangeText={changed}
        onComplete={complete}
      />
    </PanelUIProvider>
  );
  const input = screen.getByLabelText("Code") as HTMLInputElement;
  fireEvent.input(input, { target: { value: "AB" } });
  await act(async () => {
    await Promise.resolve();
  });
  expect(changed).toHaveBeenCalledWith("AB");
  expect(input.value).toBe("A");
  expect(screen.getByLabelText("Code")).toBe(input);
  tree.rerender(
    <PanelUIProvider>
      <OtpInput
        accessibilityLabel="Code"
        type="text"
        length={4}
        value="ABCD"
        onComplete={complete}
      />
    </PanelUIProvider>
  );
  expect(input.value).toBe("ABCD");
  expect(complete).not.toHaveBeenCalled();
});
it("mask, groups, placeholders, error tint and source sizes preserve independent cell layout", () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <OtpInput
        accessibilityLabel="Code"
        length={4}
        defaultValue="12"
        groupEvery={2}
        mask
        placeholder="·"
        size="sm"
        errorMessage="Invalid code"
      />
    </PanelUIProvider>
  );
  expect(screen.getAllByText("•")).toHaveLength(2);
  expect(screen.getAllByText("·")).toHaveLength(2);
  expect(tree.container.querySelectorAll('[class*="h-[80px]"]')).toHaveLength(
    4
  );
  expect(screen.getByLabelText("Code").getAttribute("aria-invalid")).toBe(
    "true"
  );
  expect(screen.getByText("Invalid code").className).toContain(
    "panel-destructive"
  );
  expect(
    tree.container.querySelector('[class*="bg-[var(--panel-border)]"]')
  ).toBeTruthy();
});
it("disabled wins over editable and imperative focus uses the single native field", async () => {
  const handle = createRef<InputHandle>();
  const change = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <OtpInput
        ref={handle}
        accessibilityLabel="Code"
        disabled
        editable
        onChangeText={change}
      />
    </PanelUIProvider>
  );
  const input = screen.getByLabelText("Code") as HTMLInputElement;
  expect(input.disabled).toBe(true);
  fireEvent.input(input, { target: { value: "123" } });
  await act(async () => {
    await Promise.resolve();
  });
  expect(change).not.toHaveBeenCalled();
  expect(input.value).toBe("");
  tree.rerender(
    <PanelUIProvider>
      <OtpInput ref={handle} accessibilityLabel="Code" />
    </PanelUIProvider>
  );
  act(() => handle.current?.focus());
  expect(input.dataset.taroFocus).toBe("true");
  fireEvent.focus(input);
  expect(handle.current?.isFocused()).toBe(true);
  fireEvent.blur(input);
  expect(handle.current?.isFocused()).toBe(false);
});
it("native focus requests follow external prop changes after mounting", () => {
  const tree = render(
    <PanelUIProvider>
      <OtpInput accessibilityLabel="Code" focus={false} />
    </PanelUIProvider>
  );
  const input = screen.getByLabelText("Code");
  expect(input.dataset.taroFocus).toBe("false");
  tree.rerender(
    <PanelUIProvider>
      <OtpInput accessibilityLabel="Code" focus />
    </PanelUIProvider>
  );
  expect(input.dataset.taroFocus).toBe("true");
  tree.rerender(
    <PanelUIProvider>
      <OtpInput accessibilityLabel="Code" focus={false} />
    </PanelUIProvider>
  );
  expect(input.dataset.taroFocus).toBe("false");
});

it("keeps the focused native editor outside the cells without relying on opacity", () => {
  render(
    <PanelUIProvider>
      <OtpInput accessibilityLabel="Hidden code editor" defaultValue="161511" />
    </PanelUIProvider>
  );
  const input = screen.getByLabelText("Hidden code editor") as HTMLInputElement;
  fireEvent.focus(input);
  expect(input.value).toBe("161511");
  expect(input.style.color).toBe("transparent");
  expect(input.style.caretColor).toBe("transparent");
  expect(input.style.width).toBe("1px");
  expect(input.style.height).toBe("1px");
  expect(input.style.left).toBe("-10000px");
});
