// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Skeleton } from "../src/components/Skeleton";
import { Spinner } from "../src/components/Spinner";

it("explicit empty loading labels follow source announcement semantics", () => {
  const { rerender } = render(<Spinner label="" />);
  expect(screen.getByRole("progressbar")).toBeTruthy();
  expect(screen.getByRole("progressbar").getAttribute("aria-busy")).toBe(
    "true"
  );
  rerender(<Skeleton label="" />);
  expect(screen.getByRole("progressbar").getAttribute("aria-hidden")).toBe(
    "false"
  );
});
