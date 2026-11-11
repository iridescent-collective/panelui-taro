// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { expect, it, vi } from "vitest";

import { Text } from "../src/components/primitives/Text";
import { readTaroStyle } from "./taro-style";

it("text maps source nativeID and onPress to the same native text node", () => {
  const onPress = vi.fn();
  const ref = createRef<ComponentRef<typeof Text>>();
  render(
    <Text ref={ref} nativeID="original-text" onPress={onPress}>
      原文
    </Text>
  );
  const text = screen.getByText("原文");
  expect(text.id).toBe("original-text");
  expect(ref.current).toBe(text);
  fireEvent.click(text);
  expect(onPress).toHaveBeenCalledTimes(1);
});
it("line limits clamp source paragraphs and zero releases the limit", () => {
  const { rerender } = render(<Text numberOfLines={2}>长正文</Text>);
  expect(readTaroStyle(screen.getByText("长正文"))).toContain(
    '"WebkitLineClamp":2'
  );
  rerender(
    <Text numberOfLines={1} ellipsizeMode="clip">
      长正文
    </Text>
  );
  expect(readTaroStyle(screen.getByText("长正文"))).toContain(
    '"textOverflow":"clip"'
  );
  rerender(<Text numberOfLines={0}>长正文</Text>);
  expect(readTaroStyle(screen.getByText("长正文"))).not.toContain(
    "WebkitLineClamp"
  );
});
it("native event and id overrides win while custom paragraph styles remain intact", () => {
  const original = vi.fn();
  const native = vi.fn();
  render(
    <Text
      nativeID="original"
      id="native"
      onPress={original}
      onClick={native}
      numberOfLines={2}
      style={{ textAlign: "center" }}
    >
      优先级
    </Text>
  );
  const text = screen.getByText("优先级");
  expect(text.id).toBe("native");
  expect(readTaroStyle(text)).toContain('"textAlign":"center"');
  fireEvent.click(text);
  expect(native).toHaveBeenCalledTimes(1);
  expect(original).not.toHaveBeenCalled();
});
