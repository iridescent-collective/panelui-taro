// @vitest-environment happy-dom
import { fireEvent, render } from "@testing-library/react";
import { forwardRef } from "react";
import { expect, it, vi } from "vitest";

vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tarojs/components")>();
  return {
    ...actual,
    View: forwardRef((props: Record<string, unknown>, ref) => (
      <actual.View
        {...props}
        ref={ref as never}
        data-test-style={JSON.stringify(props.style)}
      />
    )),
  };
});
const readTaroStyle = (element: Element | null) =>
  element?.getAttribute("data-test-style");
import { entry } from "../official/flip-card";

const sourceHeights = [340, 340, 320, 320, 200, 140, 140, 140];
it.each(
  entry.demos.map((demo, index) => ({ demo, height: sourceHeights[index] }))
)(
  "preserves the Native height of $height points on both faces of $demo.label",
  ({ demo, height }) => {
    const Demo = demo.render;
    const { container } = render(<Demo />);
    const card = container.querySelector("[aria-expanded]");
    expect(card).toBeTruthy();
    const dimensions = readTaroStyle(card);
    expect(JSON.parse(dimensions ?? "{}").height).toBe(`${height * 2}rpx`);
    if (card?.getAttribute("role") === "button") {
      fireEvent.click(card);
      expect(readTaroStyle(card)).toBe(dimensions);
    }
  }
);
