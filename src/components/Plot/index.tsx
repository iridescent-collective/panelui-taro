import { PlotXAxis, PlotYAxis } from "./axis";
import { PlotLayer, PlotOverlay } from "./custom";
import { PlotArea, PlotBars, PlotDots, PlotGrid, PlotLine } from "./geometry";
import { PlotHeader, PlotLegend } from "./labels";
import { PlotRoot } from "./root";
import { PlotRule } from "./rule";
import { PlotCursor, PlotTooltip } from "./tooltip";

export { usePlotGeometry as usePlot, usePlotCursor } from "./context";
export { usePlotLayer, usePlotAnimatedLayer } from "./custom";
export type {
  PlotProps,
  PlotGeometry,
  PlotHandle,
  PlotStatus,
  PlotCurve,
  PlotDatum,
  PlotScale,
  PlotBound,
  PlotGridProps,
  PlotSeriesProps,
  PlotLineProps,
  PlotAreaProps,
  PlotBarsProps,
  PlotDotsProps,
  PlotLayerProps,
  PlotOverlayProps,
  PlotRuleProps,
  PlotXAxisProps,
  PlotYAxisProps,
  PlotCursorProps,
  PlotTooltipProps,
  PlotHeaderProps,
  PlotLegendProps,
  PlotLayoutEvent,
} from "./types";
export const Plot = Object.assign(PlotRoot, {
  Area: PlotArea,
  Bars: PlotBars,
  Cursor: PlotCursor,
  Dots: PlotDots,
  Grid: PlotGrid,
  Header: PlotHeader,
  Layer: PlotLayer,
  Legend: PlotLegend,
  Line: PlotLine,
  Overlay: PlotOverlay,
  Rule: PlotRule,
  Tooltip: PlotTooltip,
  XAxis: PlotXAxis,
  YAxis: PlotYAxis,
});

export {
  areaPath,
  bandOf,
  barPath,
  compactNumber,
  linePath,
  segment,
  xOf,
  yOf,
} from "../../lib/chart";
export { xAt } from "./math";
export type { Plot as PlotBox, ChartPoint } from "../../lib/chart";
export {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Pattern,
  Polygon,
  Rect,
  Stop,
  SvgLine,
  SvgText,
} from "../../primitives/static-svg";
