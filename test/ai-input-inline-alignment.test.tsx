// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { AIInput } from "../src/components/AIInput";
import { PanelUIProvider } from "../src/components/Provider";

for (const [size, height, lineHeight, padding] of [
  ["sm", 52, 40, 6],
  ["md", 60, 44, 8],
  ["lg", 68, 48, 10],
] as const) {
  it(`centres the inline placeholder and entered text at ${size} size`, () => {
    render(
      <PanelUIProvider>
        <AIInput size={size} defaultValue="Hello">
          <AIInput.Row>
            <AIInput.Field placeholder="Ask anything" />
          </AIInput.Row>
        </AIInput>
      </PanelUIProvider>
    );
    const field = screen.getByPlaceholderText("Ask anything");
    const style = JSON.parse((field as HTMLElement).dataset.taroStyle ?? "{}");
    expect(style.height).toBe(`${height}rpx`);
    expect(style.lineHeight).toBe(`${lineHeight}rpx`);
    expect(style.paddingTop).toBe(`${padding}rpx`);
    expect(style.paddingBottom).toBe(`${padding}rpx`);
    expect(height).toBe(lineHeight + padding * 2);
  });
}
