// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { TagInput } from "../src/components/TagInput";
import { nativeTagProps } from "../src/components/TagInput/native-props";
import {
  addCandidates,
  reconcileMarkedTag,
  splitOn,
} from "../src/components/TagInput/state";
import { reflowOffset } from "../src/components/TagInput/tag-motion";
import { useTagRecords } from "../src/components/TagInput/use-records";
import { useTags } from "../src/components/TagInput/use-tags";
import { deferred } from "./helpers/deferred";
import { showActionSheet } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const inputText = async (text: string) => {
  fireEvent.input(screen.getByRole("textbox"), { target: { value: text } });
  await settle();
};
const field = () => screen.getByRole("textbox").parentElement;
it("source candidate rules preserve order, validate against the growing list and reject duplicates before capacity", () => {
  const validate = vi.fn((tag: string) => tag !== "bad");
  const result = addCandidates([" a ", "a", "bad", "b", "c"], [], {
    max: 2,
    validate,
  });
  expect(result.next).toEqual(["a", "b"]);
  expect(result.rejected).toEqual([
    { reason: "duplicate", tag: "a" },
    { reason: "invalid", tag: "bad" },
    { reason: "max", tag: "c" },
  ]);
  expect(validate.mock.calls.map(([tag]) => tag)).toEqual(["a", "bad", "b"]);
  expect(splitOn("a.|b.", [".", "|"])).toEqual(["a", "", "b", ""]);
  expect(reconcileMarkedTag({ index: 1, tag: "b" }, ["b", "a"])).toBeNull();
});
it("pasted delimiters commit accepted tags once and keep the trailing draft", async () => {
  const changed = vi.fn();
  const reject = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        onValueChange={changed}
        onReject={reject}
        max={3}
        showCount
      />
    </PanelUIProvider>
  );
  await inputText("a, b,a,c");
  expect(changed).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
  expect(reject).toHaveBeenCalledExactlyOnceWith("a", "duplicate");
  expect(screen.getByRole("textbox").getAttribute("aria-label")).toBe("Topics");
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("c");
  expect(screen.getByText("2 / 3")).toBeTruthy();
});
it("submit commits a trimmed draft and rejected blur keeps the word available to fix", () => {
  const reject = vi.fn();
  const view = renderHook(() => useTags({ max: 1, onReject: reject }));
  act(() => view.result.current.input(" one "));
  act(() => expect(view.result.current.submit()).toBe(true));
  expect(view.result.current.tags).toEqual(["one"]);
  expect(view.result.current.text).toBe("");
  act(() => view.result.current.input("two"));
  act(() => expect(view.result.current.blur()).toBe(false));
  expect(view.result.current.text).toBe("two");
  expect(reject).toHaveBeenCalledExactlyOnceWith("two", "max");
});
it.each(["clear", "keep"] as const)(
  "%s blur behavior respects the draft contract",
  (behavior) => {
    const view = renderHook(() => useTags({ blurBehavior: behavior }));
    act(() => view.result.current.input("draft"));
    act(() => view.result.current.blur());
    expect(view.result.current.text).toBe(behavior === "clear" ? "" : "draft");
    expect(view.result.current.tags).toEqual([]);
  }
);
it("duplicates and overflowing capacity are accepted only when configured and mark the field invalid", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        defaultValue={["a"]}
        max={1}
        allowOverflow
        allowDuplicates
        showCount
        onValueChange={changed}
      />
    </PanelUIProvider>
  );
  await inputText("a,b,");
  expect(changed).toHaveBeenCalledExactlyOnceWith(["a", "a", "b"]);
  expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("3 / 1")).toBeTruthy();
});
it("controlled refusal restores native draft text and does not invent accepted tags", async () => {
  const changed = vi.fn();
  const draft = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        value={["a"]}
        inputValue=""
        onValueChange={changed}
        onInputValueChange={draft}
      />
    </PanelUIProvider>
  );
  await inputText("b,");
  expect(changed).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
  expect(draft).toHaveBeenCalledExactlyOnceWith("");
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  expect(screen.queryByText("b")).toBeNull();
});
it("two source backspaces mark before deleting and controlled replacement revokes the mark", () => {
  const changed = vi.fn();
  const view = renderHook(
    ({ tags }) => useTags({ onValueChange: changed, value: tags }),
    { initialProps: { tags: ["a", "b"] } }
  );
  act(() => view.result.current.backspace());
  expect(view.result.current.marked).toEqual({ index: 1, tag: "b" });
  expect(changed).not.toHaveBeenCalled();
  view.rerender({ tags: ["a", "c"] });
  expect(view.result.current.marked).toBeNull();
  act(() => view.result.current.backspace());
  expect(changed).not.toHaveBeenCalled();
  act(() => view.result.current.backspace());
  expect(changed).toHaveBeenCalledExactlyOnceWith(["a"]);
});
it("native field menu preserves the two-step removal confirmation", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <TagInput label="Topics" defaultValue={["a", "b"]} />
    </PanelUIProvider>
  );
  await settle();
  const box = field();
  if (!box) {
    throw new Error("Tag field missing");
  }
  await act(async () => {
    dispatchTaroEvent(box, TARO_TEST_EVENTS.longPress);
    await Promise.resolve();
  });
  expect(showActionSheet).toHaveBeenLastCalledWith({
    itemList: ["Mark last tag for removal"],
  });
  expect(screen.getByText("b")).toBeTruthy();
  await act(async () => {
    dispatchTaroEvent(box, TARO_TEST_EVENTS.longPress);
    await Promise.resolve();
  });
  expect(showActionSheet).toHaveBeenLastCalledWith({ itemList: ["Remove b"] });
  expect(screen.queryByText("b")).toBeNull();
});
it("an obsolete native menu cannot mark or remove a replacement list", async () => {
  const waiting = deferred<{ tapIndex: number }>();
  showActionSheet.mockImplementationOnce(() => waiting.promise);
  const changed = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <TagInput label="Topics" value={["a", "b"]} onValueChange={changed} />
    </PanelUIProvider>
  );
  await settle();
  const box = field();
  if (!box) {
    throw new Error("Tag field missing");
  }
  act(() => dispatchTaroEvent(box, TARO_TEST_EVENTS.longPress));
  view.rerender(
    <PanelUIProvider reducedMotion>
      <TagInput label="Topics" value={["a", "c"]} onValueChange={changed} />
    </PanelUIProvider>
  );
  await act(async () => {
    waiting.resolve({ tapIndex: 0 });
    await waiting.promise;
  });
  expect(changed).not.toHaveBeenCalled();
  expect(screen.getByText("c")).toBeTruthy();
});
it("read-only hides entry and removal while disabled refuses input and clear", async () => {
  const changed = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <TagInput
        defaultValue={["a"]}
        readOnly
        clearable
        onValueChange={changed}
      />
    </PanelUIProvider>
  );
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByRole("button", { name: "Remove a" })).toBeNull();
  view.rerender(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        defaultValue={["a"]}
        disabled
        clearable
        onValueChange={changed}
      />
    </PanelUIProvider>
  );
  await inputText("b,");
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Clear all tags" })).toBeNull();
});
it("clear empties both tags and draft and error text replaces the description", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        defaultValue={["a"]}
        clearable
        errorMessage="Invalid"
        description="Details"
        onValueChange={changed}
      />
    </PanelUIProvider>
  );
  await inputText("draft");
  fireEvent.click(screen.getByRole("button", { name: "Clear all tags" }));
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith([]);
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
  expect(screen.queryByText("a")).toBeNull();
  expect(screen.queryByText("Details")).toBeNull();
  expect(screen.getByText("Invalid")).toBeTruthy();
});
it("exit records remain for the source 120ms duration and cleanup cancels expiry", () => {
  vi.useFakeTimers();
  try {
    const view = renderHook(({ tags }) => useTagRecords(tags, false), {
      initialProps: { tags: ["a", "b"] },
    });
    view.rerender({ tags: ["a"] });
    expect(view.result.current).toHaveLength(2);
    expect(view.result.current[1]?.expires).not.toBeNull();
    act(() => vi.advanceTimersByTime(119));
    expect(view.result.current).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(view.result.current).toHaveLength(1);
    view.rerender({ tags: [] });
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("reflow starts from the currently displayed offset when a prior movement is interrupted", () => {
  const before = { height: 12, left: 40, top: 10, width: 20 };
  const after = { height: 12, left: 10, top: 30, width: 20 };
  expect(reflowOffset(before, { x: 5, y: -2 }, after)).toEqual({
    x: 35,
    y: -22,
  });
});
it("batched native input events preserve every locally accepted token and the latest draft", () => {
  const view = renderHook(() => useTags({}));
  act(() => {
    view.result.current.input("a,");
    view.result.current.input("b,");
    view.result.current.input("c");
    view.result.current.submit();
  });
  expect(view.result.current.tags).toEqual(["a", "b", "c"]);
  expect(view.result.current.text).toBe("");
});

it("native confirmation commits the current draft and keeps entry available", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <TagInput label="Topics" onValueChange={changed} />
    </PanelUIProvider>
  );
  await inputText("one");
  await act(async () => {
    dispatchTaroEvent(screen.getByRole("textbox"), TARO_TEST_EVENTS.confirm, {
      value: "one",
    });
    await Promise.resolve();
  });
  expect(changed).toHaveBeenCalledExactlyOnceWith(["one"]);
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
});
it("native input aliases preserve supported source keyboard, password and submit props", () => {
  expect(
    nativeTagProps({
      keyboardType: "numeric",
      returnKeyType: "send",
      secureTextEntry: true,
    })
  ).toEqual({ confirmType: "send", password: true, type: "digit" });
  expect(nativeTagProps({ keyboardType: "phone-pad" }).type).toBe("number");
  expect(nativeTagProps({ keyboardType: "numeric", type: "text" }).type).toBe(
    "text"
  );
});
it("clearing an error to an empty string restores the source description", () => {
  const view = render(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        errorMessage="Invalid"
        description="Describe the topic"
      />
    </PanelUIProvider>
  );
  expect(screen.queryByText("Describe the topic")).toBeNull();
  view.rerender(
    <PanelUIProvider reducedMotion>
      <TagInput
        label="Topics"
        errorMessage=""
        description="Describe the topic"
      />
    </PanelUIProvider>
  );
  expect(screen.getByText("Describe the topic")).toBeTruthy();
  expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe(
    "false"
  );
});
