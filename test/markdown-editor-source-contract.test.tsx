// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useEffect } from "react";
import { expect, it, vi } from "vitest";

import { MarkdownEditor } from "../src/components/MarkdownEditor";
import type {
  MarkdownEditorHandle,
  MarkdownEditorAction,
} from "../src/components/MarkdownEditor";
import { ACTIONS } from "../src/components/MarkdownEditor/actions";
import { useMarkdownEditor } from "../src/components/MarkdownEditor/context";
import {
  continueList,
  toggleWrap,
} from "../src/components/MarkdownEditor/transforms";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/markdown-editor-source.json";
import {
  dispatchTaroEvent,
  dispatchTaroInput,
  TARO_TEST_EVENTS,
} from "./taro-components";

it.each(FIXTURES.frames)(
  "matches source transform with documented unwrap end correction $kind/$text/$selection",
  ({ kind, text, selection, output }) => {
    const result =
      kind === "continueList"
        ? continueList(text, selection)
        : ACTIONS[kind as MarkdownEditorAction].apply(text, selection);
    let expected = output;
    if (kind === "bold" || kind === "italic") {
      const marker = kind === "bold" ? "**" : "_";
      const a = Math.max(0, Math.min(text.length, selection.start));
      const b = Math.max(0, Math.min(text.length, selection.end));
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      const selected = text.slice(start, end);
      const inside =
        selected.length >= marker.length * 2 &&
        selected.startsWith(marker) &&
        selected.endsWith(marker);
      const outside =
        text.slice(Math.max(0, start - marker.length), start) === marker &&
        text.slice(end, end + marker.length) === marker;
      if (!inside && outside && output && "selection" in output) {
        expected = {
          ...output,
          selection: { end: end - marker.length, start: start - marker.length },
        };
      }
    }
    expect(result).toEqual(expected);
  }
);
it("removing outside markers keeps exactly the same selected text", () => {
  expect(toggleWrap("**hello**", { end: 7, start: 2 }, "**")).toEqual({
    selection: { end: 5, start: 0 },
    text: "hello",
  });
});
it("native selection formats twice without losing caret and toolbar reflects active markers", () => {
  const ref = createRef<MarkdownEditorHandle>();
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <MarkdownEditor ref={ref} defaultValue="hello" onValueChange={change} />
    </PanelUIProvider>
  );
  act(() =>
    dispatchTaroEvent(
      screen.getByRole("textbox"),
      TARO_TEST_EVENTS.selectionChange,
      { selectionEnd: 5, selectionStart: 0 }
    )
  );
  fireEvent.click(screen.getByRole("button", { name: "Bold" }));
  expect(change).toHaveBeenLastCalledWith("**hello**");
  expect(ref.current?.getSelection()).toEqual({ end: 7, start: 2 });
  expect(ref.current?.getActive()).toContain("bold");
  fireEvent.click(screen.getByRole("button", { name: "Bold" }));
  expect(change).toHaveBeenLastCalledWith("hello");
  expect(ref.current?.getSelection()).toEqual({ end: 5, start: 0 });
});
const PendingSelectionProbe = () => {
  const { pending } = useMarkdownEditor();
  return (
    <output data-testid="pending-selection">
      {JSON.stringify(pending ?? null)}
    </output>
  );
};
it("consumes a requested selection on native typing without a selection-change event", () => {
  const ref = createRef<MarkdownEditorHandle>();
  render(
    <PanelUIProvider reducedMotion>
      <MarkdownEditor ref={ref} defaultValue="hello">
        <MarkdownEditor.Input />
        <PendingSelectionProbe />
      </MarkdownEditor>
    </PanelUIProvider>
  );
  act(() => ref.current?.setSelection({ end: 4, start: 1 }));
  fireEvent.input(screen.getByRole("textbox"), {
    target: { selectionEnd: 2, selectionStart: 2, value: "hXo" },
  });
  expect(screen.getByTestId("pending-selection").textContent).toBe(
    JSON.stringify({ end: 2, start: 2 })
  );
  expect(ref.current?.getSelection()).toEqual({ end: 2, start: 2 });
  fireEvent.input(screen.getByRole("textbox"), {
    target: { selectionEnd: 3, selectionStart: 3, value: "hXYo" },
  });
  expect(screen.getByTestId("pending-selection").textContent).toBe(
    JSON.stringify({ end: 3, start: 3 })
  );
  act(() => ref.current?.apply("bold"));
  expect(screen.getByRole("textbox")).toHaveProperty("value", "hXY****o");
});
it.each([
  { before: "hello", cursor: 2, native: "hXo", replacement: "hXo" },
  {
    before: "- hello",
    cursor: 8,
    native: "- hello\n",
    replacement: "- hello\n- ",
  },
])(
  "returns the current native rewrite rather than a stale controlled value: $native",
  ({ before, cursor, native, replacement }) => {
    render(
      <PanelUIProvider reducedMotion>
        <MarkdownEditor defaultValue={before} />
      </PanelUIProvider>
    );
    let returned: unknown;
    act(() => {
      returned = dispatchTaroInput(screen.getByRole("textbox"), {
        cursor,
        value: native,
      });
    });
    expect(returned).toBe(replacement);
  }
);
it("continues bullet lists on native input, exits an empty item and switches preview", () => {
  const ref = createRef<MarkdownEditorHandle>();
  render(
    <PanelUIProvider reducedMotion>
      <MarkdownEditor ref={ref} defaultValue="- hello" />
    </PanelUIProvider>
  );
  fireEvent.input(screen.getByRole("textbox"), {
    target: { value: "- hello\n" },
  });
  expect(screen.getByRole("textbox")).toHaveProperty("value", "- hello\n- ");
  expect(ref.current?.getSelection()).toEqual({ end: 10, start: 10 });
  fireEvent.input(screen.getByRole("textbox"), {
    target: { value: "- hello\n- \n" },
  });
  expect(screen.getByRole("textbox")).toHaveProperty("value", "- hello\n");
  fireEvent.click(screen.getByRole("button", { name: "Preview" }));
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.getByText("hello")).toBeTruthy();
});

const FocusProbe = ({ focus }: { focus: () => void }) => {
  const ctx = useMarkdownEditor();
  useEffect(() => {
    ctx.registerField(
      ctx.mode === "write"
        ? { blur: () => {}, clear: () => {}, focus, isFocused: () => false }
        : null
    );
    return () => ctx.registerField(null);
  }, [ctx.mode, ctx.registerField, focus]);
  return null;
};
it("toolbar formatting restores the native input focus after a button press", () => {
  const focus = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <MarkdownEditor defaultValue="Hello">
        <MarkdownEditor.Toolbar />
        <FocusProbe focus={focus} />
      </MarkdownEditor>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Bold" }));
  expect(focus).toHaveBeenCalledOnce();
});
it("imperative focus from preview reaches the input after it mounts", () => {
  const ref = createRef<MarkdownEditorHandle>();
  const focus = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <MarkdownEditor ref={ref} defaultMode="preview">
        <FocusProbe focus={focus} />
      </MarkdownEditor>
    </PanelUIProvider>
  );
  act(() => ref.current?.focus());
  expect(focus).toHaveBeenCalledOnce();
});
