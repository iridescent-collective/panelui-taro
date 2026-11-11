// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import { entry } from "../official/fab";

it.each(entry.demos.filter((demo) => demo.fullPage))(
  "constrains the $label preview so its anchored button stays in the viewport",
  (demo) => {
    const Demo = demo.render;
    const { container } = render(<Demo />);
    const frame = container.querySelector('[id^="official-"]');
    expect(frame?.className).toContain("min-h-0");
    // Taro scroll-view needs a zero height flex basis to avoid sizing its
    // positioned parent to the full list instead of the available viewport.
    for (const scroll of container.querySelectorAll('[id^="scroll-"]')) {
      if (scroll.id.endsWith("-end")) continue;
      expect(scroll.className).toContain("h-0");
      expect(scroll.className).toContain("flex-1");
    }
    expect(
      frame?.querySelector(
        '[aria-label="New note"], [aria-label="Add something"]'
      ) ?? frame?.querySelector('[role="button"]')
    ).toBeTruthy();
  }
);
