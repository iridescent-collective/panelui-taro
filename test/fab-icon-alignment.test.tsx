// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Fab } from "../src/components/Fab";
import { PanelUIProvider } from "../src/components/Provider";
import { PlusIcon } from "../src/icons";

it.each(["sm", "md", "lg"] as const)(
  "%s Fab keeps the glyph free of inline baseline space while rotating open and closed",
  (size) => {
    const sample = (open: boolean) => (
      <PanelUIProvider reducedMotion>
        <Fab.Group
          open={open}
          size={size}
          icon={<PlusIcon size={24} />}
          accessibilityLabel="Toggle dial"
        >
          <Fab.Action label="Photo" />
        </Fab.Group>
      </PanelUIProvider>
    );
    const view = render(sample(false));
    const button = screen.getByRole("button", { name: "Toggle dial" });
    const glyph = button.querySelector("img")!;
    const rotation = glyph.parentElement!;
    expect(getComputedStyle(glyph).display).toBe("block");
    expect(rotation.style.transform).toBe("rotate(0deg)");
    view.rerender(sample(true));
    expect(button.querySelector("img")).toBe(glyph);
    expect(getComputedStyle(glyph).display).toBe("block");
    expect(rotation.style.transform).toBe("rotate(45deg)");
    view.rerender(sample(false));
    expect(button.querySelector("img")).toBe(glyph);
    expect(rotation.style.transform).toBe("rotate(0deg)");
  }
);
