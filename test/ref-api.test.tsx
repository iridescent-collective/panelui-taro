// @vitest-environment happy-dom

import type { ScrollView, Text as TaroText, View } from "@tarojs/components";
import { render } from "@testing-library/react";
import { Input } from "panelui-taro/input";
import type {
  ScrollViewRef,
  TextInputRef,
  TextRef,
  ViewRef,
} from "panelui-taro/primitives/refs";
import { Textarea } from "panelui-taro/textarea";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { expect, expectTypeOf, it } from "vitest";

it("public ref aliases match the Taro hosts and the existing input adapters", () => {
  expectTypeOf<ViewRef>().toEqualTypeOf<ComponentRef<typeof View>>();
  expectTypeOf<TextRef>().toEqualTypeOf<ComponentRef<typeof TaroText>>();
  expectTypeOf<ScrollViewRef>().toEqualTypeOf<
    ComponentRef<typeof ScrollView>
  >();
  expectTypeOf<TextInputRef>().toEqualTypeOf<ComponentRef<typeof Input>>();
  expectTypeOf<TextInputRef>().toEqualTypeOf<ComponentRef<typeof Textarea>>();
  const input = createRef<TextInputRef>();
  const textarea = createRef<TextInputRef>();
  render(
    <>
      <Input ref={input} />
      <Textarea ref={textarea} />
    </>
  );
  for (const ref of [input, textarea]) {
    expect(ref.current?.isFocused()).toBe(false);
    expect(ref.current).toMatchObject({
      blur: expect.any(Function),
      clear: expect.any(Function),
      focus: expect.any(Function),
    });
  }
});
