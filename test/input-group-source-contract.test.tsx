// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { expect, it } from "vitest";

import { Direction } from "../src/components/Direction";
import { InputGroup } from "../src/components/InputGroup";
import { useInputGroupMeasurements } from "../src/components/InputGroup/measurements";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("decorator ownership keeps the largest live width and removes only the departing owner", () => {
  const { result } = renderHook(() => useInputGroupMeasurements());
  const first = Symbol("first");
  const second = Symbol("second");
  act(() => {
    result.current.measureDecorator("prefix", first, 20);
    result.current.measureDecorator("prefix", second, 40);
  });
  expect(result.current.prefixWidth).toBe(40);
  act(() => result.current.removeDecorator("prefix", second));
  expect(result.current.prefixWidth).toBe(20);
  act(() => result.current.measureDecorator("prefix", first, Number.NaN));
  expect(result.current.prefixWidth).toBe(0);
});
it("actual decorator measurements pad both sides and unmount restores native padding", async () => {
  setTestMeasurement(40, 375);
  const { rerender } = render(
    <InputGroup>
      <InputGroup.Prefix>前缀</InputGroup.Prefix>
      <InputGroup.Input />
      <InputGroup.Suffix>后缀</InputGroup.Suffix>
    </InputGroup>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
      '"paddingLeft":"80rpx"'
    )
  );
  expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
    '"paddingRight":"80rpx"'
  );
  rerender(
    <InputGroup>
      <InputGroup.Input />
      <InputGroup.Suffix>后缀</InputGroup.Suffix>
    </InputGroup>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).not.toContain(
      '"paddingLeft"'
    )
  );
});
it("RTL sends prefix padding to the physical right and disabled flows to the input", async () => {
  setTestMeasurement(40, 375);
  render(
    <Direction dir="rtl">
      <InputGroup isDisabled>
        <InputGroup.Prefix>单位</InputGroup.Prefix>
        <InputGroup.Input />
      </InputGroup>
    </Direction>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
      '"paddingRight":"80rpx"'
    )
  );
  expect(screen.getByRole("textbox").getAttribute("aria-disabled")).toBe(
    "true"
  );
});
const GrowingPrefix = () => {
  const [label, setLabel] = useState("9");
  return <button onClick={() => setLabel("1000")}>{label}</button>;
};
it("descendant state changes refresh decorator width without replacing parent children", async () => {
  setTestMeasurement(12, 375);
  render(
    <InputGroup>
      <InputGroup.Prefix>
        <GrowingPrefix />
      </InputGroup.Prefix>
      <InputGroup.Input />
    </InputGroup>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
      '"paddingLeft":"24rpx"'
    )
  );
  setTestMeasurement(36, 375);
  fireEvent.click(screen.getByRole("button", { name: "9" }));
  await waitFor(() =>
    expect(readTaroStyle(screen.getByRole("textbox"))).toContain(
      '"paddingLeft":"72rpx"'
    )
  );
});
