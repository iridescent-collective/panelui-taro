// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Accordion } from "../src/components/Accordion";
import { Collapsible } from "../src/components/Collapsible";

it.each(["accordion", "collapsible"])(
  "%s centers a sized indicator in both axes like the upstream Yoga View",
  (kind) => {
    const style = document.createElement("style");
    style.textContent =
      ".flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}";
    document.head.append(style);
    try {
      render(
        kind === "accordion" ? (
          <Accordion>
            <Accordion.Item value="section">
              <Accordion.Trigger>
                <Accordion.Title>Section</Accordion.Title>
                <Accordion.Indicator
                  data-testid="indicator"
                  style={{ height: 32, width: 32 }}
                />
              </Accordion.Trigger>
            </Accordion.Item>
          </Accordion>
        ) : (
          <Collapsible>
            <Collapsible.Trigger>
              <Collapsible.Title>Section</Collapsible.Title>
              <Collapsible.Indicator
                data-testid="indicator"
                style={{ height: 32, width: 32 }}
              />
            </Collapsible.Trigger>
          </Collapsible>
        )
      );
      const layout = getComputedStyle(screen.getByTestId("indicator"));
      expect(layout.display).toBe("flex");
      expect(layout.flexDirection).toBe("column");
      expect(layout.alignItems).toBe("center");
      expect(layout.justifyContent).toBe("center");
    } finally {
      style.remove();
    }
  }
);
