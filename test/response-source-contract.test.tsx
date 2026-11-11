// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Response } from "../src/components/Response";
import { parseMarkdown } from "../src/components/Response/markdown";

it("streaming fences preserve code and finished incomplete fences remain literal", () => {
  expect(parseMarkdown("```ts\nconst value = 1", true)).toEqual([
    { code: "const value = 1", language: "ts", open: true, type: "code" },
  ]);
  expect(
    parseMarkdown("```ts\nconst value = 1", false).every(
      (block) => block.type === "paragraph"
    )
  ).toBe(true);
  render(<Response isStreaming>{"```ts\nconst value = 1"}</Response>);
  expect(screen.queryByRole("button", { name: "Copy code" })).toBeNull();
});

it("new handlers and view props are honored even when answer text is unchanged", () => {
  const original = vi.fn();
  const next = vi.fn();
  const { rerender, container } = render(
    <Response id="before" onLinkPress={original}>
      [文档](https://example.com)
    </Response>
  );
  rerender(
    <Response id="after" onLinkPress={next}>
      [文档](https://example.com)
    </Response>
  );
  fireEvent.click(screen.getByText("文档"));
  expect(original).not.toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith("https://example.com");
  expect(container.firstElementChild?.id).toBe("after");
});

it("parseIncompleteMarkdown changes take effect without changing the streamed text", () => {
  const { rerender } = render(<Response isStreaming>**未完成</Response>);
  expect(screen.getByText("未完成").className).toContain("font-semibold");
  rerender(
    <Response isStreaming parseIncompleteMarkdown={false}>
      **未完成
    </Response>
  );
  expect(screen.getByText("**未完成")).toBeTruthy();
});

it("markdown never fetches unsolicited images and forbidden links remain non-interactive", () => {
  const link = vi.fn();
  render(
    <Response onLinkPress={link}>
      ![图片](https://example.com/image.png) [拒绝](javascript:alert(1))
    </Response>
  );
  fireEvent.click(screen.getByText("拒绝"));
  expect(link).not.toHaveBeenCalled();
  expect(screen.queryByRole("img")).toBeNull();
});

it("markdown tables preserve alignment and quote blocks can contain nested code", () => {
  const blocks = parseMarkdown(
    "| A | B |\n| :--- | ---: |\n| first | 42 |\n\n> ```ts\n> const a = 1\n> ```"
  );
  expect(blocks[0]).toMatchObject({ align: ["left", "right"], type: "table" });
  expect(blocks[1]).toMatchObject({
    blocks: [{ code: "const a = 1", type: "code" }],
    type: "quote",
  });
  render(<Response>{"| A | B |\n| :--- | ---: |\n| first | 42 |"}</Response>);
  expect(screen.getByRole("table")).toBeTruthy();
  expect(screen.getAllByRole("columnheader")).toHaveLength(2);
});

it("deeply nested untrusted quotes cannot exhaust the JavaScript stack", () => {
  const document = `${">".repeat(10_000)}正文`;
  expect(() => parseMarkdown(document)).not.toThrow();
});
