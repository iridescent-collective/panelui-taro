// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { CodeBlock } from "../src/components/CodeBlock";
import {
  highlight,
  resolveLanguage,
} from "../src/components/CodeBlock/highlight";
import { useCopyToClipboard } from "../src/hooks/use-copy-to-clipboard";
import { deferred } from "./helpers/deferred";
import { setClipboardData } from "./taro-api";

afterEach(() => {
  setClipboardData.mockReset();
  setClipboardData.mockResolvedValue({ errMsg: "setClipboardData:ok" });
  vi.useRealTimers();
});
it("highlighter keeps source line contents, known syntax and diff tokens", () => {
  const code = 'const answer = "42";\n\n未知语言';
  const lines = highlight(code, "typescript");
  expect(lines.map((line) => line.map((token) => token.text).join(""))).toEqual(
    code.split("\n")
  );
  expect(
    lines[0].some((token) => token.kind === "keyword" && token.text === "const")
  ).toBe(true);
  expect(resolveLanguage("Unknown")).toBe("text");
  expect(
    highlight("+add\n-delete", "patch").map((line) => line[0].kind)
  ).toEqual(["inserted", "deleted"]);
});

it("copy writes the current code without a toast and signals completion only after platform success", async () => {
  const onCopy = vi.fn();
  render(
    <CodeBlock code="const a = 1;" language="ts" showLineNumbers>
      <CodeBlock.Header>
        <CodeBlock.Filename>test.ts</CodeBlock.Filename>
        <CodeBlock.CopyButton onCopy={onCopy} />
      </CodeBlock.Header>
    </CodeBlock>
  );
  fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  });
  expect(setClipboardData).toHaveBeenCalledWith({
    data: "const a = 1;",
    showToast: false,
  });
  expect(onCopy).toHaveBeenCalledTimes(1);
});

it("clipboard failures preserve idle state and never call success callbacks", async () => {
  setClipboardData.mockRejectedValueOnce(new Error("clipboard denied"));
  const onCopy = vi.fn();
  render(
    <CodeBlock code="text">
      <CodeBlock.CopyButton onCopy={onCopy} />
    </CodeBlock>
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await Promise.resolve();
  });
  expect(screen.queryByRole("button", { name: "Copied" })).toBeNull();
  expect(onCopy).not.toHaveBeenCalled();
});

it("copy timeout resets feedback and unmount ignores a late platform response", async () => {
  vi.useFakeTimers();
  const { result, unmount } = renderHook(() =>
    useCopyToClipboard({ timeout: 100 })
  );
  await act(async () => {
    await result.current.copy("ready");
  });
  expect(result.current.copied).toBe(true);
  act(() => {
    vi.advanceTimersByTime(100);
  });
  expect(result.current.copied).toBe(false);
  const pending = deferred<{ errMsg: string }>();
  setClipboardData.mockReturnValueOnce(pending.promise);
  const copy = result.current.copy("late");
  unmount();
  pending.resolve({ errMsg: "ok" });
  await copy;
  expect(vi.getTimerCount()).toBe(0);
});
