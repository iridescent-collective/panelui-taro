// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Post } from "../src/components/Post";
import { PanelUIProvider } from "../src/components/Provider";

it("preserves the compact timestamp and dot as non-shrinking single-line metadata", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Post variant="compact">
        <Post.Header>
          <Post.Author
            name="Learning parent"
            handle="@parent"
            timestamp="3m ago"
            verified
            fallback="LP"
          />
        </Post.Header>
      </Post>
    </PanelUIProvider>
  );
  for (const value of ["3m ago", "·"]) {
    const metadata = screen.getByText(value);
    expect(metadata.className.split(" ")).toContain("shrink-0");
    expect(metadata.style.whiteSpace).toBe("nowrap");
  }
});
