// @vitest-environment happy-dom

import { render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Collapse } from "../src/primitives/collapse";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("measured transition preserves the same nodes and releases clipping after opening", async () => {
  setTestMeasurement(40, 375);
  const { rerender } = render(
    <Collapse open>
      <span>内容</span>
    </Collapse>
  );
  const content = screen.getByText("内容");
  const clip = content.parentElement?.parentElement;
  expect(readTaroStyle(clip)).not.toContain("height");
  rerender(
    <Collapse open={false}>
      <span>内容</span>
    </Collapse>
  );
  await waitFor(() => expect(readTaroStyle(clip)).toContain('"height":"0rpx"'));
  expect(screen.getByText("内容")).toBe(content);
  rerender(
    <Collapse open>
      <span>内容</span>
    </Collapse>
  );
  await waitFor(() =>
    expect(readTaroStyle(clip)).toContain('"height":"40rpx"')
  );
  await waitFor(() => expect(readTaroStyle(clip)).not.toContain("height"));
  expect(screen.getByText("内容")).toBe(content);
});
it("reduced motion immediately arrives at the new state and caller id remains public", () => {
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Collapse open id="retained">
        <span>内容</span>
      </Collapse>
    </PanelUIProvider>
  );
  expect(screen.getByText("内容").parentElement?.id).toBe("retained");
  rerender(
    <PanelUIProvider reducedMotion>
      <Collapse open={false} id="retained">
        <span>内容</span>
      </Collapse>
    </PanelUIProvider>
  );
  expect(
    readTaroStyle(screen.getByText("内容").parentElement?.parentElement)
  ).toContain('"height":"0rpx"');
});
