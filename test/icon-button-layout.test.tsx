// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Panelside } from "../src/components/Panelside";
import { PlannerArrow } from "../src/components/Planner/parts";
import { PanelUIProvider } from "../src/components/Provider";

it.each([
  "Next month",
  "Previous month",
  "More options",
  "Search",
  "Open navigation panel",
])("%s retains upstream Yoga centering in a flex container", (label) => {
  const style = document.createElement("style");
  style.textContent =
    ".flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}";
  document.head.append(style);
  try {
    render(
      <PanelUIProvider reducedMotion>
        <PlannerArrow direction="next" onPress={() => {}} />
        <PlannerArrow direction="previous" onPress={() => {}} />
        <Panelside dock={false}>
          <Panelside.Action />
          <Panelside.SearchTrigger />
          <Panelside.Trigger />
        </Panelside>
      </PanelUIProvider>
    );
    const layout = getComputedStyle(
      screen.getByRole("button", { name: label })
    );
    expect(layout.display).toBe("flex");
    expect(layout.flexDirection).toBe("column");
    expect(layout.alignItems).toBe("center");
    expect(layout.justifyContent).toBe("center");
  } finally {
    style.remove();
  }
});
