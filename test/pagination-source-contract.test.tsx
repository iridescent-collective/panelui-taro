// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { Pagination, paginationRange } from "../src/components/Pagination";
import { ChevronLeftIcon } from "../src/icons";

it("page ranges hold a fixed target count and show single missing pages instead of ellipses", () => {
  expect(paginationRange({ count: 20, page: 8 })).toEqual([
    1,
    "start-ellipsis",
    7,
    8,
    9,
    "end-ellipsis",
    20,
  ]);
  for (const page of [1, 2, 4, 8, 19, 20]) {
    expect(paginationRange({ count: 20, page })).toHaveLength(7);
  }
  expect(paginationRange({ count: 7, page: 4 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
});
it("uncontrolled ellipsis requests jump and controlled requests do not commit until acknowledged", () => {
  const change = vi.fn();
  const { rerender } = render(<Pagination count={20} onPageChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "Forward 5 pages" }));
  expect(change).toHaveBeenLastCalledWith(6);
  expect(
    screen.getByRole("button", { name: "Page 6" }).getAttribute("aria-selected")
  ).toBe("true");
  rerender(<Pagination count={20} page={1} onPageChange={change} />);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(change).toHaveBeenLastCalledWith(2);
  expect(
    screen.getByRole("button", { name: "Page 1" }).getAttribute("aria-selected")
  ).toBe("true");
});
it("shrinking count clamps the displayed page and disables the exhausted arrow", () => {
  const change = vi.fn();
  render(
    <Pagination count={3} page={8} onPageChange={change} variant="compact" />
  );
  expect(screen.getByLabelText("Page 3 of 3")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Previous" }));
  expect(change).toHaveBeenCalledWith(2);
});
it("RTL arrows mirror once rather than choosing and mirroring opposite glyphs twice", () => {
  const { container } = render(
    <Direction dir="rtl">
      <Pagination count={3} page={2} />
      <ChevronLeftIcon size={20} color="#262626" data-testid="reference-left" />
    </Direction>
  );
  const arrow = screen
    .getByRole("button", { name: "Previous" })
    .querySelector("img");
  const images = [...container.querySelectorAll("img")];
  expect(arrow?.getAttribute("src")).toBe(images.at(-1)?.getAttribute("src"));
});
it("status spans end at the real total and simple presentation renders translated caller controls", () => {
  render(
    <Pagination count={3} page={3} variant="simple">
      <Pagination.Status pageSize={20} total={45} />
    </Pagination>
  );
  expect(screen.getByText("41–45 of 45")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Page 3" })).toBeNull();
  expect(screen.getByText("Previous")).toBeTruthy();
});

it.each(["ltr", "rtl"] as const)(
  "%s pagination arrows avoid inline image baseline space inside their mirroring wrapper",
  (dir) => {
    render(
      <Direction dir={dir}>
        <Pagination count={3} variant="simple" />
      </Direction>
    );
    for (const name of ["Previous", "Next"]) {
      const arrow = screen.getByRole("button", { name }).querySelector("img")!;
      expect(getComputedStyle(arrow).display).toBe("block");
      expect(arrow.parentElement?.style.transform).toBe(
        dir === "rtl" ? "scaleX(-1)" : "scaleX(1)"
      );
    }
  }
);

it("keeps overflowing page targets in a horizontal scroll viewport and leaves the last page reachable", () => {
  const change = vi.fn();
  render(<Pagination count={12} variant="numbers" onPageChange={change} />);
  const nav = screen.getByRole("navigation");
  const viewport = nav.querySelector('[data-taro-scroll-x="true"]');
  expect(viewport).not.toBeNull();
  expect(viewport?.className).toContain("min-w-0");
  const list = viewport?.firstElementChild;
  expect(list?.className).toContain("w-max");
  expect(list?.className).toContain("min-w-full");
  const last = screen.getByRole("button", { name: "Page 12" });
  expect(viewport?.contains(last)).toBe(true);
  expect(last.className).toContain("shrink-0");
  expect(
    screen.getByRole("button", { name: "Forward 5 pages" }).className
  ).toContain("shrink-0");
  fireEvent.click(last);
  expect(change).toHaveBeenCalledWith(12);
  expect(last.getAttribute("aria-selected")).toBe("true");
});
