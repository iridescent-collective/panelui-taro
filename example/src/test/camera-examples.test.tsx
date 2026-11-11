// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { entry } from "../official/camera";
it.each(entry.demos)("renders the Camera $label composition", (demo) => {
  const Demo = demo.render;
  const { container } = render(<Demo />);
  expect(container.textContent).toContain("Platform hooks acceptance");
  expect(container.querySelector('[aria-label="Take photo"], [aria-label="Record video"]')).toBeTruthy();
});
