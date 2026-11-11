// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { NumberInput } from "../src/components/NumberInput";
import { OtpInput } from "../src/components/OtpInput";
import { PanelUIProvider } from "../src/components/Provider";
import { SearchBar } from "../src/components/SearchBar";
import type { SearchBarHandle } from "../src/components/SearchBar";
import { searchPanelHeight } from "../src/components/SearchBar/panel-math";
import { TagInput } from "../src/components/TagInput";
import { Textarea } from "../src/components/Textarea";
import { deferred } from "./helpers/deferred";
import {
  emitKeyboardHeight,
  setElementMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
const node = (id: string) => {
  const found = document.querySelector<HTMLElement>(`#${id}`);
  if (!found) {
    throw new Error(`Missing ${id}`);
  }
  return found;
};
const wrapper = (child: ReactNode) => (
  <PanelUIProvider reducedMotion>{child}</PanelUIProvider>
);
it("onChangeText fires immediately while query debounce skips mount, waits and cleans old requests", () => {
  vi.useFakeTimers();
  const changed = vi.fn();
  const debounced = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar
        id="debounced-search"
        defaultValue="Initial"
        debounce={200}
        onChangeText={changed}
        onDebouncedChange={debounced}
      />
    )
  );
  expect(debounced).not.toHaveBeenCalled();
  fireEvent.input(node("debounced-search"), { target: { value: "First" } });
  expect(changed).toHaveBeenLastCalledWith("First");
  act(() => vi.advanceTimersByTime(100));
  fireEvent.input(node("debounced-search"), { target: { value: "Last" } });
  act(() => vi.advanceTimersByTime(199));
  expect(debounced).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(debounced).toHaveBeenCalledExactlyOnceWith("Last");
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("submit flushes debounce before submit and native confirm callbacks", () => {
  vi.useFakeTimers();
  const order: string[] = [];
  const tree = render(
    wrapper(
      <SearchBar
        id="submit-search"
        debounce={200}
        onDebouncedChange={(value) => order.push(`debounce:${value}`)}
        onSubmit={(value) => order.push(`submit:${value}`)}
        onSubmitEditing={() => order.push("editing")}
        onConfirm={() => order.push("confirm")}
      />
    )
  );
  fireEvent.input(node("submit-search"), { target: { value: "Books" } });
  act(() =>
    dispatchTaroEvent(node("submit-search"), TARO_TEST_EVENTS.confirm, {
      value: "Books",
    })
  );
  expect(order).toEqual([
    "debounce:Books",
    "submit:Books",
    "editing",
    "confirm",
  ]);
  act(() => vi.advanceTimersByTime(200));
  expect(order).toHaveLength(4);
  tree.unmount();
  vi.useRealTimers();
});
it("a pending debounce calls the latest handler without moving the user's deadline", () => {
  vi.useFakeTimers();
  const previous = vi.fn();
  const latest = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar
        id="latest-search"
        debounce={200}
        onDebouncedChange={previous}
      />
    )
  );
  fireEvent.input(node("latest-search"), { target: { value: "Books" } });
  act(() => vi.advanceTimersByTime(100));
  tree.rerender(
    wrapper(
      <SearchBar id="latest-search" debounce={200} onDebouncedChange={latest} />
    )
  );
  act(() => vi.advanceTimersByTime(100));
  expect(previous).not.toHaveBeenCalled();
  expect(latest).toHaveBeenCalledExactlyOnceWith("Books");
  tree.unmount();
  vi.useRealTimers();
});
it("controlled refusal keeps accepted text and does not debounce an unaccepted request", async () => {
  const changed = vi.fn();
  const debounced = vi.fn();
  render(
    wrapper(
      <SearchBar
        id="controlled-search"
        value="Accepted"
        onChangeText={changed}
        onDebouncedChange={debounced}
      />
    )
  );
  fireEvent.input(node("controlled-search"), { target: { value: "Refused" } });
  await settle();
  expect(changed).toHaveBeenCalledWith("Refused");
  expect(debounced).not.toHaveBeenCalled();
  expect((node("controlled-search") as HTMLInputElement).value).toBe(
    "Accepted"
  );
});
it("clear keeps focus and cancel empties the query, releases focus and reports cancellation", async () => {
  const cleared = vi.fn();
  const cancelled = vi.fn();
  render(
    wrapper(
      <SearchBar
        id="clear-search"
        defaultValue="Books"
        cancel="always"
        onClear={cleared}
        onCancel={cancelled}
      />
    )
  );
  fireEvent.focus(node("clear-search"));
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  await settle();
  expect(cleared).toHaveBeenCalledOnce();
  expect((node("clear-search") as HTMLInputElement).value).toBe("");
  expect(node("clear-search").dataset.taroFocus).toBe("true");
  fireEvent.input(node("clear-search"), { target: { value: "Again" } });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  await settle();
  expect(cancelled).toHaveBeenCalledOnce();
  expect(node("clear-search").dataset.taroFocus).toBe("false");
});
it("loading replaces clear and disabled fields do not clear, submit or open results", () => {
  const submit = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar
        id="blocked-search"
        value="Books"
        loading
        disabled
        onSubmit={submit}
      >
        <SearchBar.Item>Result</SearchBar.Item>
      </SearchBar>
    )
  );
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  act(() =>
    dispatchTaroEvent(node("blocked-search"), TARO_TEST_EVENTS.confirm, {
      value: "Books",
    })
  );
  expect(submit).not.toHaveBeenCalled();
  expect(tree.container.querySelector("#blocked-search-panel")).toBeNull();
});
it("the same field survives panel opening and attaches only the growing edge without replacing its input", async () => {
  const tree = render(
    wrapper(
      <SearchBar id="panel-search" cancel="focus">
        <SearchBar.Section label="Suggested">
          <SearchBar.Item description="Reading">Books</SearchBar.Item>
        </SearchBar.Section>
      </SearchBar>
    )
  );
  const field = node("panel-search");
  expect(tree.container.querySelector("#panel-search-panel")).toBeNull();
  fireEvent.focus(field);
  await settle();
  expect(node("panel-search")).toBe(field);
  expect(tree.container.querySelector("#panel-search-panel")).toBeTruthy();
  expect(field.className).toContain("rounded-t-none");
  expect(readTaroStyle(node("panel-search-anchor"))).toContain('"zIndex":20');
});
it("panel max-height preserves the exact source room clamp and minimum, including keyboard lift", () => {
  expect(
    searchPanelHeight({
      anchor: { height: 48, top: 500 },
      avoiding: false,
      height: 667,
      keyboard: 0,
      offset: 12,
      placement: "top",
    })
  ).toBe(320);
  expect(
    searchPanelHeight({
      anchor: { height: 48, top: 500 },
      avoiding: true,
      height: 667,
      keyboard: 200,
      offset: 12,
      placement: "top",
    })
  ).toBe(320);
  expect(
    searchPanelHeight({
      anchor: { height: 48, top: 100 },
      avoiding: false,
      cap: 200,
      height: 667,
      keyboard: 200,
      offset: 12,
      placement: "bottom",
    })
  ).toBe(200);
  expect(
    searchPanelHeight({
      anchor: null,
      avoiding: false,
      cap: 40,
      height: 667,
      keyboard: 200,
      offset: 12,
      placement: "top",
    })
  ).toBe(160);
});
it("cancel width is measured while hidden and expands without remounting the field", async () => {
  setElementMeasurement("cancel-search-cancel", {
    height: 48,
    left: 0,
    top: 0,
    width: 40,
  });
  render(wrapper(<SearchBar id="cancel-search" cancel="focus" />));
  await settle();
  const field = node("cancel-search");
  const clip = node("cancel-search-cancel").parentElement;
  expect(readTaroStyle(clip)).toContain('"width":"0rpx"');
  fireEvent.focus(field);
  await settle();
  expect(readTaroStyle(clip)).toContain('"width":"96rpx"');
  expect(node("cancel-search")).toBe(field);
});
it("tokens keep explicit removal labels and native long press offers last-token removal only for an empty query", async () => {
  const remove = vi.fn();
  const last = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar
        id="token-search"
        onRemoveLastToken={last}
        tokens={<SearchBar.Token onRemove={remove}>Books</SearchBar.Token>}
      />
    )
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove Books" }));
  expect(remove).toHaveBeenCalledOnce();
  const token = screen.getByText("Books").parentElement;
  const scroll = token?.parentElement?.parentElement;
  const wrapperNode = scroll?.parentElement;
  if (!wrapperNode) {
    throw new Error("Missing token scroll wrapper");
  }
  await act(async () => {
    dispatchTaroEvent(wrapperNode, TARO_TEST_EVENTS.longPress);
    await Promise.resolve();
  });
  expect(showActionSheet).toHaveBeenCalledWith({
    itemList: ["Remove last token"],
  });
  expect(last).toHaveBeenCalledOnce();
  tree.unmount();
});
it("moving focus to another Panel Input never lets the first search take back the shared keyboard", async () => {
  vi.useFakeTimers();
  const tree = render(
    wrapper(
      <>
        <SearchBar id="first-search">
          <SearchBar.Item>First result</SearchBar.Item>
        </SearchBar>
        <SearchBar id="second-search">
          <SearchBar.Item>Second result</SearchBar.Item>
        </SearchBar>
      </>
    )
  );
  fireEvent.focus(node("first-search"));
  act(() => emitKeyboardHeight(200));
  fireEvent.blur(node("first-search"));
  fireEvent.focus(node("second-search"));
  act(() => vi.advanceTimersByTime(220));
  await settle();
  expect(node("first-search-panel").getAttribute("aria-hidden")).toBe("true");
  act(() => vi.advanceTimersByTime(120));
  expect(tree.container.querySelector("#first-search-panel")).toBeNull();
  expect(tree.container.querySelector("#second-search-panel")).toBeTruthy();
  tree.unmount();
  vi.useRealTimers();
});
it("press-in on a search action retains focus before a blur can close the panel", async () => {
  vi.useFakeTimers();
  const action = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar id="guard-search">
        <SearchBar.Item
          trailing={
            <SearchBar.Action id="add-result" onPress={action}>
              Add
            </SearchBar.Action>
          }
        >
          Books
        </SearchBar.Item>
      </SearchBar>
    )
  );
  fireEvent.focus(node("guard-search"));
  fireEvent.touchStart(node("add-result"));
  fireEvent.blur(node("guard-search"));
  fireEvent.click(node("add-result"));
  act(() => vi.advanceTimersByTime(220));
  await settle();
  expect(tree.container.querySelector("#guard-search-panel")).toBeTruthy();
  expect(action).toHaveBeenCalledOnce();
  expect(node("guard-search").dataset.taroFocus).toBe("true");
  tree.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("imperative blur ends recovery deliberately, clear follows query state and focus uses the native handle", async () => {
  vi.useFakeTimers();
  const ref = createRef<SearchBarHandle>();
  const tree = render(
    wrapper(
      <SearchBar ref={ref} id="imperative-search" defaultValue="Books">
        <SearchBar.Item>Result</SearchBar.Item>
      </SearchBar>
    )
  );
  fireEvent.focus(node("imperative-search"));
  act(() => emitKeyboardHeight(200));
  act(() => ref.current?.clear());
  expect((node("imperative-search") as HTMLInputElement).value).toBe("");
  act(() => ref.current?.blur());
  fireEvent.blur(node("imperative-search"));
  act(() => vi.advanceTimersByTime(220));
  await settle();
  expect(tree.container.querySelector("#imperative-search-panel")).toBeNull();
  expect(node("imperative-search").dataset.taroFocus).toBe("false");
  act(() => ref.current?.focus());
  expect(node("imperative-search").dataset.taroFocus).toBe("true");
  tree.unmount();
  vi.useRealTimers();
});
it("empty mapped children and text alone never create an empty result card", () => {
  const tree = render(
    wrapper(
      <SearchBar id="no-results" panel="always">
        {[]}
      </SearchBar>
    )
  );
  expect(tree.container.querySelector("#no-results-panel")).toBeNull();
  tree.rerender(
    wrapper(
      <SearchBar id="no-results" panel="always">
        Nothing
      </SearchBar>
    )
  );
  expect(tree.container.querySelector("#no-results-panel")).toBeNull();
});
it("StrictMode effect replay does not leave native token removal permanently disabled", async () => {
  const removed = vi.fn();
  render(
    <StrictMode>
      {wrapper(
        <SearchBar
          id="strict-search"
          onRemoveLastToken={removed}
          tokens={<SearchBar.Token>Strict token</SearchBar.Token>}
        />
      )}
    </StrictMode>
  );
  const token = screen.getByText("Strict token").parentElement;
  const target = token?.parentElement?.parentElement?.parentElement;
  if (!target) {
    throw new Error("Missing native token wrapper");
  }
  await act(async () => {
    dispatchTaroEvent(target, TARO_TEST_EVENTS.longPress);
    await Promise.resolve();
  });
  expect(removed).toHaveBeenCalledOnce();
});
it("WeChat result lists use a fixed measured scroll viewport capped to source room", async () => {
  setElementMeasurement("scroll-search-panel-list-content", {
    height: 500,
    left: 0,
    top: 0,
    width: 300,
  });
  setElementMeasurement("scroll-search-anchor", {
    height: 48,
    left: 0,
    top: 500,
    width: 300,
  });
  render(
    wrapper(
      <SearchBar id="scroll-search" panel="always" panelMaxHeight={200}>
        <SearchBar.Item>Books</SearchBar.Item>
      </SearchBar>
    )
  );
  await settle();
  expect(readTaroStyle(node("scroll-search-panel-list"))).toContain(
    '"height":"400rpx"'
  );
});
it("StrictMode initial effect replay still skips initial query debounce", () => {
  const debounced = vi.fn();
  render(
    <StrictMode>
      {wrapper(
        <SearchBar defaultValue="Initial" onDebouncedChange={debounced} />
      )}
    </StrictMode>
  );
  expect(debounced).not.toHaveBeenCalled();
});
it.each(["textarea", "otp", "tags", "number"] as const)(
  "switching from search to a Panel %s retains the new input's focus",
  async (kind) => {
    vi.useFakeTimers();
    const fields = {
      number: <NumberInput id="foreign-field" />,
      otp: <OtpInput id="foreign-field" />,
      tags: <TagInput id="foreign-field" />,
      textarea: <Textarea id="foreign-field" />,
    };
    const tree = render(
      wrapper(
        <>
          <SearchBar id="foreign-search">
            <SearchBar.Item>Result</SearchBar.Item>
          </SearchBar>
          {fields[kind]}
        </>
      )
    );
    fireEvent.focus(node("foreign-search"));
    act(() => emitKeyboardHeight(200));
    fireEvent.blur(node("foreign-search"));
    fireEvent.focus(node("foreign-field"));
    act(() => vi.advanceTimersByTime(220));
    await settle();
    expect(node("foreign-search-panel").getAttribute("aria-hidden")).toBe(
      "true"
    );
    expect(node("foreign-search").dataset.taroFocus).toBe("false");
    tree.unmount();
    vi.useRealTimers();
  }
);
it("confirming a stale removal menu cannot remove the last token of a replacement selection", async () => {
  const pending = deferred<{ tapIndex: number }>();
  showActionSheet.mockImplementationOnce(() => pending.promise);
  const previous = vi.fn();
  const replacement = vi.fn();
  const tree = render(
    wrapper(
      <SearchBar
        id="stale-token"
        tokens={<SearchBar.Token key="old">Old token</SearchBar.Token>}
        onRemoveLastToken={previous}
      />
    )
  );
  const token = screen.getByText("Old token").parentElement;
  const target = token?.parentElement?.parentElement?.parentElement;
  if (!target) {
    throw new Error("Missing native token wrapper");
  }
  act(() => dispatchTaroEvent(target, TARO_TEST_EVENTS.longPress));
  tree.rerender(
    wrapper(
      <SearchBar
        id="stale-token"
        tokens={<SearchBar.Token key="new">New token</SearchBar.Token>}
        onRemoveLastToken={replacement}
      />
    )
  );
  await act(async () => {
    pending.resolve({ tapIndex: 0 });
    await Promise.resolve();
  });
  expect(previous).not.toHaveBeenCalled();
  expect(replacement).not.toHaveBeenCalled();
});
it("a late blur under the press guard does not reclaim a field that has already focused elsewhere", async () => {
  vi.useFakeTimers();
  const tree = render(
    wrapper(
      <>
        <SearchBar id="guarded-first">
          <SearchBar.Action id="guarded-action">Add</SearchBar.Action>
        </SearchBar>
        <SearchBar id="guarded-next">
          <SearchBar.Item>Next</SearchBar.Item>
        </SearchBar>
      </>
    )
  );
  fireEvent.focus(node("guarded-first"));
  act(() => emitKeyboardHeight(200));
  fireEvent.touchStart(node("guarded-action"));
  fireEvent.focus(node("guarded-next"));
  fireEvent.blur(node("guarded-first"));
  expect(node("guarded-first").dataset.taroFocus).toBe("false");
  act(() => vi.advanceTimersByTime(220));
  await settle();
  expect(node("guarded-first-panel").getAttribute("aria-hidden")).toBe("true");
  tree.unmount();
  vi.useRealTimers();
});
