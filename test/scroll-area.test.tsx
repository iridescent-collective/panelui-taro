import type { ScrollView } from "@tarojs/components";
// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentRef } from "react";
import { expect, it, vi } from "vitest";

import { ScrollArea } from "../src/components/ScrollArea";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

it("preserves native scroll events, anchors and viewport refs", () => {
  const onScroll = vi.fn();
  const ref = createRef<ComponentRef<typeof ScrollView>>();
  const { container, rerender } = render(
    <ScrollArea
      ref={ref}
      scrollIntoView="second"
      onScroll={onScroll}
      contentContainerClassName="exercise-content"
    >
      <div id="second">Second question</div>
    </ScrollArea>
  );
  const viewport = container.querySelector<HTMLDivElement>("div");
  expect(ref.current).toBe(viewport);
  expect(viewport?.getAttribute("scrollintoview")).toBe("second");
  expect(
    screen.getByText("Second question").parentElement?.className
  ).toContain("exercise-content");
  expect(viewport?.dataset.taroScrollX).toBe("false");
  dispatchTaroEvent(viewport!, TARO_TEST_EVENTS.scroll, { scrollTop: 150 });
  expect(onScroll).toHaveBeenCalledWith({ detail: { scrollTop: 150 } });
  rerender(
    <ScrollArea orientation="horizontal">Horizontal content</ScrollArea>
  );
  expect(
    container.querySelector<HTMLDivElement>("div")?.dataset.taroScrollX
  ).toBe("true");
});
