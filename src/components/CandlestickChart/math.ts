import { bandOf, yOf } from "../../lib/chart";
import type { Plot } from "../../lib/chart";
import type { CandlestickChartDatum } from "./types";

const MIN_BODY_HEIGHT = 1.5;
const WICK_WIDTH = 1.5;
export const ohlcOf = (
  row: CandlestickChartDatum | undefined,
  openKey: string,
  highKey: string,
  lowKey: string,
  closeKey: string
): {
  open: number;
  high: number;
  low: number;
  close: number;
} | null => {
  if (!row) {
    return null;
  }
  const open = row[openKey];
  const high = row[highKey];
  const low = row[lowKey];
  const close = row[closeKey];
  if (
    typeof open !== "number" ||
    typeof high !== "number" ||
    typeof low !== "number" ||
    typeof close !== "number" ||
    Number.isNaN(open) ||
    Number.isNaN(high) ||
    Number.isNaN(low) ||
    Number.isNaN(close)
  ) {
    return null;
  }
  return { close, high, low, open };
};
export const candleExtent = (
  data: CandlestickChartDatum[],
  openDataKey: string,
  highDataKey: string,
  lowDataKey: string,
  closeDataKey: string,
  yDomain?: [number, number]
): [number, number] => {
  if (yDomain) {
    return yDomain;
  }
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const row of data) {
    const ohlc = ohlcOf(
      row,
      openDataKey,
      highDataKey,
      lowDataKey,
      closeDataKey
    );
    if (!ohlc) {
      continue;
    }
    if (ohlc.low < min) {
      min = ohlc.low;
    }
    if (ohlc.high > max) {
      max = ohlc.high;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1];
  }
  if (min === max) {
    const nudge = Math.abs(min) * 0.05 || 1;
    return [min - nudge, max + nudge];
  }
  const margin = (max - min) * 0.1;
  return [min - margin, max + margin];
};
export const candleColumns = (
  data: CandlestickChartDatum[],
  openKey: string,
  highKey: string,
  lowKey: string,
  closeKey: string
) => {
  const opens: number[] = [];
  const highs: number[] = [];
  const lows: number[] = [];
  const closes: number[] = [];
  const usable: boolean[] = [];
  for (const row of data) {
    const ohlc = ohlcOf(row, openKey, highKey, lowKey, closeKey);
    opens.push(ohlc?.open ?? 0);
    highs.push(ohlc?.high ?? 0);
    lows.push(ohlc?.low ?? 0);
    closes.push(ohlc?.close ?? 0);
    usable.push(ohlc !== null);
  }
  return { closes, highs, lows, opens, usable };
};
export interface CandleFrame {
  columns: ReturnType<typeof candleColumns>;
  plot: Plot;
  width: number;
  min: number;
  max: number;
  grow: number;
  active: number;
  cornerRadius: number;
}
const bodyPath = (
  x: number,
  top: number,
  width: number,
  height: number,
  r: number
) =>
  r <= 0
    ? `M${x} ${top}h${width}v${height}h${-width}Z`
    : `M${x + r} ${top}h${width - r * 2}a${r} ${r} 0 0 1 ${r} ${r}v${height - r * 2}a${r} ${r} 0 0 1 ${-r} ${r}h${-(width - r * 2)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(height - r * 2)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
export const candlePath = (
  input: CandleFrame,
  wantRising: boolean,
  wicks: boolean
) => {
  const { columns, plot, width, cornerRadius } = input;
  const total = columns.usable.length;
  const { min, max, grow } = input;
  if (max === min || total === 0 || plot.width <= 0) {
    return { d: "" };
  }
  let path = "";
  for (let index = 0; index < total; index += 1) {
    if (!columns.usable[index]) {
      continue;
    }
    const open = columns.opens[index] ?? 0;
    const close = columns.closes[index] ?? 0;
    const up = close >= open;
    if (up !== wantRising) {
      continue;
    }
    const start = total > 1 ? (index / total) * 0.45 : 0;
    const eased = Math.max(0, Math.min(1, (grow - start) / 0.55));
    if (eased <= 0) {
      continue;
    }
    const centre = bandOf(index, total, plot);
    const half = width / 2;
    if (wicks) {
      const high = columns.highs[index] ?? 0;
      const low = columns.lows[index] ?? 0;
      const yHigh = yOf(high, plot, min, max);
      const yLow = yOf(low, plot, min, max);
      const mid = (yHigh + yLow) / 2;
      const top = mid + (yHigh - mid) * eased;
      const bottom = mid + (yLow - mid) * eased;
      const x = centre - WICK_WIDTH / 2;
      path += `M${x} ${top}h${WICK_WIDTH}V${bottom}h${-WICK_WIDTH}Z`;
      continue;
    }
    const yOpen = yOf(open, plot, min, max);
    const yClose = yOf(close, plot, min, max);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const height = Math.max(bodyBottom - bodyTop, MIN_BODY_HEIGHT);
    const mid = bodyTop + height / 2;
    const grown = height * eased;
    const top = mid - grown / 2;
    const r = Math.max(0, Math.min(cornerRadius, width / 2, grown / 2));
    const x = centre - half;
    path += bodyPath(x, top, width, grown, r);
  }
  return { d: path };
};
export const candleHighlight = (input: CandleFrame, wantRising: boolean) => {
  const { columns, plot, width, cornerRadius } = input;
  const total = columns.usable.length;
  const { min, max, active: index } = input;
  if (index < 0 || index >= total || max === min || !columns.usable[index]) {
    return { d: "" };
  }
  const open = columns.opens[index] ?? 0;
  const close = columns.closes[index] ?? 0;
  if (close >= open !== wantRising) {
    return { d: "" };
  }
  const high = columns.highs[index] ?? 0;
  const low = columns.lows[index] ?? 0;
  const centre = bandOf(index, total, plot);
  const yOpen = yOf(open, plot, min, max);
  const yClose = yOf(close, plot, min, max);
  const bodyTop = Math.min(yOpen, yClose);
  const height = Math.max(Math.abs(yClose - yOpen), MIN_BODY_HEIGHT);
  const x = centre - width / 2;
  const r = Math.max(0, Math.min(cornerRadius, width / 2, height / 2));
  const wickX = centre - WICK_WIDTH / 2;
  const wick =
    `M${wickX} ${yOf(high, plot, min, max)}h${WICK_WIDTH}` +
    `V${yOf(low, plot, min, max)}h${-WICK_WIDTH}Z`;
  const body = bodyPath(x, bodyTop, width, height, r);
  return { d: `${wick}${body}` };
};
