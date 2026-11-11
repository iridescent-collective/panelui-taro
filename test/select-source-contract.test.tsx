// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Select, useSelectSearch } from "../src/components/Select";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const Wrapper = () => {
  const [value, setValue] = useState<string>();
  return (
    <Select
      value={value}
      onValueChange={setValue}
      searchable
      presentation="inline"
    >
      <Select.Group label="Europe">
        <Select.Item value="fr" label="France" />
        <Select.Item value="uk" label="United Kingdom" disabled />
      </Select.Group>
      <Select.Group label="Asia">
        <Select.Item value="cn" label="China" />
      </Select.Group>
    </Select>
  );
};
it("filters grouped labels, refuses disabled rows, closes and resets its filter", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Wrapper />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  const search = screen.getByLabelText("Search");
  fireEvent.input(search, { target: { value: "FRAN" } });
  expect(screen.queryByText("Asia")).toBeNull();
  expect(screen.getByText("France")).toBeTruthy();
  fireEvent.click(screen.getByRole("menuitem"));
  await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
  expect(screen.getByRole("combobox").textContent).toContain("France");
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.getByLabelText("Search").getAttribute("value")).toBe("");
  fireEvent.click(screen.getByText("United Kingdom"));
  expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe(
    "true"
  );
});
it("disabled triggers and disabled native options retain the public contract", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Select native disabled presentation="inline" onValueChange={change}>
        <Select.Item value="a" label="Unavailable" disabled />
      </Select>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  expect(screen.queryByText("Unavailable")).toBeNull();
  expect(change).not.toHaveBeenCalled();
});
const CustomRows = () => {
  const { query } = useSelectSearch();
  return <Select.Item value="custom" label={`Custom ${query}`} />;
};
it("keeps caller rows available and exposes the search to custom lists", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Select native presentation="inline" searchable onValueChange={vi.fn()}>
        <CustomRows />
      </Select>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.input(screen.getByLabelText("Search"), {
    target: { value: "outside" },
  });
  expect(screen.getByText("Custom outside")).toBeTruthy();
  expect(screen.queryByText("No matches")).toBeNull();
});
it("controlled refusal does not invent a selected value and unknown matches show the source empty slot", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Select
        presentation="inline"
        searchable
        value="a"
        onValueChange={vi.fn()}
      >
        <Select.Item value="a" label="Alpha" />
        <Select.Item value="b" label="Beta" />
      </Select>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.input(screen.getByLabelText("Search"), {
    target: { value: "zzz" },
  });
  expect(screen.getByText("No matches")).toBeTruthy();
  fireEvent.input(screen.getByLabelText("Search"), {
    target: { value: "Beta" },
  });
  fireEvent.click(screen.getByText("Beta"));
  await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
  expect(screen.getByRole("combobox").textContent).toContain("Alpha");
});
it("overlay measures its trigger, selects, and dismisses through the outside layer", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Select presentation="overlay" onValueChange={change}>
        <Select.Item value="x" label="Measured option" />
      </Select>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() => expect(screen.getByRole("menuitem")).toBeTruthy());
  fireEvent.click(screen.getByText("Measured option"));
  expect(change).toHaveBeenCalledWith("x");
  await waitFor(() => expect(screen.queryByRole("menuitem")).toBeNull());
});
it("outside dismissal resets the query and reports the same open state as the trigger", async () => {
  const state = vi.fn();
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Select
        presentation="overlay"
        searchable
        onOpenChange={state}
        onValueChange={vi.fn()}
      >
        <Select.Item value="a" label="Alpha" />
      </Select>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() => expect(screen.getByLabelText("Search")).toBeTruthy());
  fireEvent.input(screen.getByLabelText("Search"), {
    target: { value: "zzz" },
  });
  const catcher = container.ownerDocument.querySelector(
    '.absolute.inset-0[aria-hidden="true"]'
  );
  expect(catcher).toBeTruthy();
  if (catcher) {
    fireEvent.click(catcher);
  }
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(state.mock.calls).toEqual([[true], [false]]);
  await waitFor(() => expect(screen.getByRole("combobox")).toBeTruthy());
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() => expect(screen.getByText("Alpha")).toBeTruthy());
});
it("native menu maps indexes to declared values without losing group labels", () => {
  const change = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Select native value="b" onValueChange={change}>
        <Select.Group label="Group">
          <Select.Item value="a" label="Alpha" />
          <Select.Item value="b" label="Beta" />
        </Select.Group>
      </Select>
    </PanelUIProvider>
  );
  const picker = container.querySelector('[mode="selector"]');
  expect(picker?.getAttribute("value")).toBe("1");
  if (picker) {
    act(() =>
      dispatchTaroEvent(picker, TARO_TEST_EVENTS.pickerChange, { value: "0" })
    );
  }
  expect(change).toHaveBeenCalledWith("a");
});
it("native wheel restores its owner after a rejected controlled change", async () => {
  const change = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Select native nativeAppearance="wheel" value="a" onValueChange={change}>
        <Select.Item value="a" label="Alpha" />
        <Select.Item value="b" label="Beta" />
      </Select>
    </PanelUIProvider>
  );
  const wheel = container.querySelector('[value="0"]');
  expect(wheel).toBeTruthy();
  if (wheel) {
    act(() =>
      dispatchTaroEvent(wheel, TARO_TEST_EVENTS.pickerChange, { value: [1] })
    );
  }
  expect(change).toHaveBeenCalledWith("b");
  await waitFor(() =>
    expect(container.querySelector('[value="0"]')).not.toBe(wheel)
  );
});
it("ignores a pending overlay measurement when the owner disables the trigger", async () => {
  const change = vi.fn();
  const view = (disabled: boolean) => (
    <PanelUIProvider reducedMotion>
      <Select disabled={disabled} presentation="overlay" onValueChange={change}>
        <Select.Item value="a" label="Late option" />
      </Select>
    </PanelUIProvider>
  );
  const { rerender } = render(view(false));
  fireEvent.click(screen.getByRole("combobox"));
  rerender(view(true));
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.queryByRole("menuitem")).toBeNull();
  expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe(
    "false"
  );
});
it("grouped rows preserve source column gaps and center the selected indicator", () => {
  const style = document.createElement("style");
  style.textContent =
    ".flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <Select value="fr" presentation="inline" onValueChange={vi.fn()}>
          <Select.Group label="Europe">
            <Select.Item value="fr" label="France" />
          </Select.Group>
        </Select>
      </PanelUIProvider>
    );
    fireEvent.click(screen.getByRole("combobox"));
    const row = screen.getByRole("menuitem");
    const group = screen.getByRole("heading", { name: "Europe" }).parentElement;
    expect(getComputedStyle(group as Element).display).toBe("flex");
    expect(getComputedStyle(group as Element).flexDirection).toBe("column");
    const indicator = getComputedStyle(row.lastElementChild as Element);
    expect(indicator.display).toBe("flex");
    expect(indicator.alignItems).toBe("center");
    expect(indicator.justifyContent).toBe("center");
  } finally {
    style.remove();
  }
});
