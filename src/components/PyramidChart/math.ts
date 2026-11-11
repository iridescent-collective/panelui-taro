import { barPath } from "../../lib/chart";
import type { Plot } from "../../lib/chart";
import {
  PYRAMID_PADDING,
  PYRAMID_CATEGORY_GUTTER,
  PYRAMID_CENTRE_GUTTER,
  PYRAMID_LABEL_ROW,
} from "./constants";
import type {
  PyramidChartDatum,
  PyramidChartLabelPlacement,
  PyramidChartSide,
} from "./types";

export const geometry = (plot: Plot, gutter: number) => {
  const centre = plot.left + plot.width / 2;
  return {
    centre,
    innerEnd: centre + gutter / 2,
    innerStart: centre - gutter / 2,
    wing: Math.max((plot.width - gutter) / 2, 0),
  };
};
export const pyramidChartPlot = (
  width: number,
  height: number,
  hasYAxis: boolean,
  placement: PyramidChartLabelPlacement
): Plot => {
  const left =
    hasYAxis && placement === "start"
      ? PYRAMID_CATEGORY_GUTTER
      : PYRAMID_PADDING.left;
  return {
    height: Math.max(height - PYRAMID_PADDING.top - PYRAMID_PADDING.bottom, 0),
    left,
    top: PYRAMID_PADDING.top,
    width: Math.max(width - left - PYRAMID_PADDING.right, 0),
  };
};
export const pyramidChartExtent = (
  data: PyramidChartDatum[],
  keys: string[],
  fixed?: number
): [number, number] => {
  if (fixed !== undefined && fixed > 0) {
    return [0, fixed];
  }
  let max = 0;
  for (const row of data) {
    for (const key of keys) {
      const value = row[key];
      if (typeof value === "number" && !Number.isNaN(value) && value > max) {
        max = value;
      }
    }
  }
  if (max === 0) {
    return [0, 1];
  }
  if (!Number.isFinite(max)) {
    return [0, max];
  }
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const error = rough / magnitude;
  let multiple = 1;
  if (error >= Math.sqrt(50)) {
    multiple = 10;
  } else if (error >= Math.sqrt(10)) {
    multiple = 5;
  } else if (error >= Math.sqrt(2)) {
    multiple = 2;
  }
  const step = multiple * magnitude;
  return [0, Math.ceil(max / step) * step];
};
export const pyramidLabelSpace = (
  hasYAxis: boolean,
  placement: PyramidChartLabelPlacement
) => ({
  gutter: hasYAxis && placement === "center" ? PYRAMID_CENTRE_GUTTER : 0,
  labelInset: hasYAxis && placement === "above" ? PYRAMID_LABEL_ROW : 0,
});
export interface PyramidPathOptions {
  values: (number | null)[];
  plot: Plot;
  gutter: number;
  labelInset: number;
  barGap: number;
  barWidth?: number;
  radius: number;
  minBarLength: number;
  fadedOpacity: number;
  side: PyramidChartSide;
  max: number;
  grow: number;
  active: number;
  wantActive: boolean;
  loading: boolean;
}
export const pyramidChartPath = ({
  values,
  plot,
  gutter,
  labelInset,
  barGap,
  barWidth,
  radius,
  minBarLength,
  fadedOpacity,
  side,
  max: domain,
  grow,
  active,
  wantActive,
  loading,
}: PyramidPathOptions) => {
  const total = values.length;
  if (!total || plot.width <= 0) {
    return { d: "", opacity: 1 };
  }
  const { innerStart, innerEnd, wing } = geometry(plot, gutter);
  const band = plot.height / total;
  const usable = Math.max(band - labelInset, 0);
  const thickness = Math.min(
    barWidth ?? usable * (1 - barGap),
    usable * (1 - barGap)
  );
  const max = domain || 1;
  let d = "";
  for (let i = 0; i < total; i += 1) {
    if ((i === active) !== wantActive) {
      continue;
    }
    const value = values[i];
    if (value === null || value === undefined) {
      continue;
    }
    const start = total > 1 ? (i / total) * 0.45 : 0;
    const eased = Math.max(0, Math.min(1, (grow - start) / 0.55));
    const shown = loading ? 0 : Math.max(value, 0) * eased;
    let length = (shown / max) * wing;
    if (minBarLength > 0 && shown > 0 && length < minBarLength) {
      length = minBarLength;
    }
    if (length <= 0) {
      continue;
    }
    const lead = plot.top + i * band + labelInset + (usable - thickness) / 2;
    d +=
      side === "start"
        ? barPath(innerStart - length, lead, length, thickness, radius, "left")
        : barPath(innerEnd, lead, length, thickness, radius, "right");
  }
  return { d, opacity: !wantActive && active >= 0 ? fadedOpacity : 1 };
};
