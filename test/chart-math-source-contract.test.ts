import { expect, it } from "vitest";

import {
  areaPath,
  columnValues,
  compactNumber,
  linePath,
  runsOf,
  xOf,
  yOf,
} from "../src/lib/chart";
import type { ChartCurve } from "../src/lib/chart";
import fixtures from "./fixtures/chart-source.json";

it.each(fixtures.cases)(
  "source path $curve loading=$loading domain=$domain values=$values",
  (frame) => {
    expect(
      linePath(
        frame.values,
        frame.plot,
        frame.domain[0],
        frame.domain[1],
        frame.curve as ChartCurve,
        frame.loading
      )
    ).toBe(frame.line);
    expect(
      areaPath(
        frame.values,
        frame.plot,
        frame.domain[0],
        frame.domain[1],
        frame.curve as ChartCurve,
        frame.loading
      )
    ).toBe(frame.area);
  }
);
it.each(fixtures.numbers)("source number $value", ({ value, text }) => {
  expect(compactNumber(value)).toBe(text);
});
it("single points center and nulls break rather than bridge a run", () => {
  const plot = { height: 160, left: 10, top: 12, width: 300 };
  expect(xOf(0, 1, plot)).toBe(160);
  expect(yOf(5, plot, 0, 10)).toBe(92);
  expect(runsOf([0, null, 4, 2], plot, 0, 5)).toHaveLength(2);
  expect(
    columnValues(
      [{ value: 2 }, { value: "3" }, { value: Number.NaN }, {}],
      "value"
    )
  ).toEqual([2, null, null, null]);
});

it("nonfinite column data becomes a gap before it can create invalid SVG coordinates", () => {
  expect(
    columnValues(
      [
        { value: Number.POSITIVE_INFINITY },
        { value: Number.NEGATIVE_INFINITY },
        { value: Number.NaN },
        { value: 3 },
      ],
      "value"
    )
  ).toEqual([null, null, null, 3]);
});
