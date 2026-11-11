export interface FlowEdgeDrawing {
  d: string;
  head?: string | null;
  stroke: string;
  width: number;
  dash: number[];
  offset: number;
}
export type FlowEdgeContext = Pick<
  CanvasRenderingContext2D,
  | "setTransform"
  | "clearRect"
  | "save"
  | "restore"
  | "translate"
  | "scale"
  | "beginPath"
  | "moveTo"
  | "lineTo"
  | "quadraticCurveTo"
  | "bezierCurveTo"
  | "closePath"
  | "stroke"
  | "fill"
  | "setLineDash"
  | "lineDashOffset"
  | "lineWidth"
  | "strokeStyle"
  | "fillStyle"
  | "lineCap"
  | "lineJoin"
>;

// Flow's geometry emits only absolute M/L/Q/C/Z commands. Keep the same paths
// as Native; Canvas changes the presentation without reloading an image.
export const traceFlowPath = (ctx: FlowEdgeContext, path: string) => {
  const tokens = path.match(/[MLCQZ]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/giu) ?? [];
  let i = 0;
  const read = () => Number(tokens[i++]);
  ctx.beginPath();
  while (i < tokens.length) {
    const command = tokens[i++];
    switch (command) {
      case "M":
        ctx.moveTo(read(), read());
        break;
      case "L":
        ctx.lineTo(read(), read());
        break;
      case "Q":
        ctx.quadraticCurveTo(read(), read(), read(), read());
        break;
      case "C":
        ctx.bezierCurveTo(read(), read(), read(), read(), read(), read());
        break;
      case "Z":
        ctx.closePath();
        break;
      default:
        throw new Error(`Flow: unsupported edge path command ${command}`);
    }
  }
};
export interface FlowEdgeFrame {
  width: number;
  height: number;
  x: number;
  y: number;
  zoom: number;
  drawings: FlowEdgeDrawing[];
}
export const paintFlowEdges = (
  ctx: FlowEdgeContext,
  frame: FlowEdgeFrame,
  ratioX: number,
  ratioY: number
) => {
  ctx.setTransform(ratioX, 0, 0, ratioY, 0, 0);
  ctx.clearRect(0, 0, frame.width, frame.height);
  ctx.save();
  ctx.translate(frame.x, frame.y);
  ctx.scale(frame.zoom, frame.zoom);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const drawing of frame.drawings) {
    ctx.strokeStyle = drawing.stroke;
    ctx.lineWidth = drawing.width;
    ctx.setLineDash(drawing.dash);
    ctx.lineDashOffset = drawing.offset;
    traceFlowPath(ctx, drawing.d);
    ctx.stroke();
    if (drawing.head) {
      ctx.fillStyle = drawing.stroke;
      traceFlowPath(ctx, drawing.head);
      ctx.fill();
    }
  }
  ctx.restore();
};
