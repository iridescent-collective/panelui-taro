// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Combobox } from "../src/components/Combobox";
import { useComboboxModel } from "../src/components/Combobox/use-model";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/combobox-source.json";
import { emitKeyboardHeight, setTestMeasurement } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const options = [
  <Combobox.Item key="red" value="red" label="Red" />,
  <Combobox.Group key="other" label="Other">
    <Combobox.Item value="green" label="Green" />
    <Combobox.Item value="grey" label="Grey" disabled />
  </Combobox.Group>,
];
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
it("preserves filtered options across native blur until a list tap commits or closes", () => {
  const change = vi.fn();
  const hook = renderHook(() =>
    useComboboxModel({
      children: options,
      defaultValue: "red",
      onValueChange: change,
      presentation: "inline",
    })
  );
  act(() => {
    hook.result.current.setFocused(true);
    hook.result.current.openList();
    hook.result.current.setQuery("gre");
  });
  act(() => hook.result.current.setFocused(false));
  expect(hook.result.current.query).toBe("gre");
  act(() => hook.result.current.select("green"));
  expect(change).toHaveBeenLastCalledWith("green");
  expect(hook.result.current.query).toBe("Green");
  act(() => {
    hook.result.current.openList();
    hook.result.current.setQuery("red");
  });
  act(() => hook.result.current.close());
  expect(hook.result.current.query).toBe("Green");
});
it.each(FIXTURES.submissions)(
  "matches source submit $input.multiple/$input.custom/$input.query",
  ({ input, output }) => {
    const commit = vi.fn();
    const query = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <Combobox
          mode={input.multiple ? "multiple" : "single"}
          value={input.selection}
          inputValue={input.query}
          allowCustomValue={input.custom}
          presentation="inline"
          onValueChange={commit}
          onInputValueChange={query}
        >
          {options}
        </Combobox>
      </PanelUIProvider>
    );
    commit.mockClear();
    query.mockClear();
    act(() =>
      dispatchTaroEvent(
        screen.getByRole("textbox"),
        TARO_TEST_EVENTS.confirm,
        {}
      )
    );
    const commits = output
      .filter((event) => event.kind === "commit")
      .map((event) => event.value);
    const queries = output
      .filter((event) => event.kind === "query")
      .map((event) => event.value);
    expect(commit.mock.calls.map((call) => call[0])).toEqual(commits);
    expect(query.mock.calls.map((call) => call[0])).toEqual(queries);
  }
);
it("opens inline list, filters nested groups, selects once and clears a single selection", async () => {
  const changed = vi.fn();
  const open = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Combobox
        presentation="inline"
        onValueChange={changed}
        onOpenChange={open}
        clearable
      >
        {options}
      </Combobox>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  expect(open).toHaveBeenLastCalledWith(true);
  fireEvent.focus(screen.getByRole("textbox"));
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "gre" } });
  expect(screen.queryByRole("menuitem", { name: "Red" })).toBeNull();
  fireEvent.click(screen.getByRole("menuitem", { name: "Grey" }));
  expect(changed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("menuitem", { name: "Green" }));
  expect(changed).toHaveBeenLastCalledWith("green");
  expect(open).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  expect(changed.mock.calls.at(-1)).toEqual([undefined]);
  await flush();
});
it("keeps a multiple list open, toggles selections, removes chips and prevents duplicate custom values", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Combobox
        mode="multiple"
        defaultValue={["green"]}
        presentation="inline"
        allowCustomValue
        onValueChange={changed}
      >
        {options}
      </Combobox>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Red" }));
  expect(changed).toHaveBeenLastCalledWith(["green", "red"]);
  fireEvent.click(screen.getByRole("menuitem", { name: "Green" }));
  expect(changed).toHaveBeenLastCalledWith(["red"]);
  fireEvent.click(screen.getByRole("button", { name: "Remove Red" }));
  expect(changed).toHaveBeenLastCalledWith([]);
  await flush();
});
it("disabled combobox rejects confirm, chip removal, and menu opening", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Combobox
        mode="multiple"
        disabled
        defaultValue={["red"]}
        inputValue="Novel"
        allowCustomValue
        onValueChange={change}
      >
        {options}
      </Combobox>
    </PanelUIProvider>
  );
  act(() =>
    dispatchTaroEvent(screen.getByRole("textbox"), TARO_TEST_EVENTS.confirm, {})
  );
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  expect(screen.queryByRole("menuitem", { name: "Green" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Remove Red" })).toBeNull();
  expect(change).not.toHaveBeenCalled();
});

const KeyboardProbe = () => {
  const model = useComboboxModel({ children: null });
  return <span data-testid="keyboard-height">{model.keyboardHeight}</span>;
};
it("normalizes keyboard height exactly once on wide viewports", () => {
  setTestMeasurement(600, 750);
  render(
    <PanelUIProvider reducedMotion>
      <KeyboardProbe />
    </PanelUIProvider>
  );
  act(() => emitKeyboardHeight(200));
  expect(screen.getByTestId("keyboard-height").textContent).toBe("100");
});

const SUBJECT_OPTIONS = [
  <Combobox.Item
    key="Mathematics"
    value="Mathematics"
    label="Mathematics"
    description="Study mathematics"
  />,
  <Combobox.Item key="Language" value="Language" label="Language" />,
];
const ControlledSubject = () => {
  const [value, setValue] = useState<string>();
  return (
    <PanelUIProvider reducedMotion>
      <output data-testid="subject-value">{value ?? "empty"}</output>
      <Combobox
        value={value}
        onValueChange={setValue}
        presentation="inline"
        clearable
      >
        {SUBJECT_OPTIONS}
      </Combobox>
    </PanelUIProvider>
  );
};
it("stacks an option title above its description on the mini-program platform", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Combobox presentation="inline">{SUBJECT_OPTIONS}</Combobox>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  const title = screen.getByText("Mathematics");
  const description = screen.getByText("Study mathematics");
  expect(title.parentElement).toBe(description.parentElement);
  expect(title.parentElement?.classList.contains("flex")).toBe(true);
  expect(title.parentElement?.classList.contains("flex-col")).toBe(true);
});
it("clears an explicitly controlled undefined value without reviving its first selection", async () => {
  render(<ControlledSubject />);
  expect(screen.getByTestId("subject-value").textContent).toBe("empty");
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Mathematics" }));
  await flush();
  expect(screen.getByTestId("subject-value").textContent).toBe("Mathematics");
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "" } });
  fireEvent.click(screen.getByRole("menuitem", { name: "Language" }));
  await flush();
  expect(screen.getByTestId("subject-value").textContent).toBe("Language");
  fireEvent.click(screen.getByRole("button", { name: "Clear" }));
  await flush();
  expect(screen.getByTestId("subject-value").textContent).toBe("empty");
  expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show options" }));
  for (const option of screen.getAllByRole("menuitem")) {
    expect(option.getAttribute("aria-selected")).toBe("false");
  }
});
it.each([undefined, "Mathematics"])(
  "respects a rejected controlled update from %s",
  (value) => {
    const change = vi.fn();
    const hook = renderHook(() =>
      useComboboxModel({
        children: SUBJECT_OPTIONS,
        onValueChange: change,
        value,
      })
    );
    act(() => hook.result.current.select("Language"));
    expect(change).toHaveBeenLastCalledWith("Language");
    expect(hook.result.current.values).toEqual(
      value === undefined ? [] : [value]
    );
    act(() => hook.result.current.clear());
    expect(change.mock.calls.at(-1)).toEqual([undefined]);
    expect(hook.result.current.values).toEqual(
      value === undefined ? [] : [value]
    );
  }
);
it("keeps omitted value uncontrolled and honors its default through selection and clear", () => {
  const change = vi.fn();
  const hook = renderHook(() =>
    useComboboxModel({
      children: SUBJECT_OPTIONS,
      defaultValue: "Mathematics",
      onValueChange: change,
    })
  );
  expect(hook.result.current.values).toEqual(["Mathematics"]);
  act(() => hook.result.current.select("Language"));
  expect(hook.result.current.values).toEqual(["Language"]);
  act(() => hook.result.current.clear());
  expect(hook.result.current.values).toEqual([]);
  expect(change.mock.calls).toEqual([["Language"], [undefined]]);
});
