import { expect, it } from "vitest";

import {
  paintFlowEdges,
  traceFlowPath,
} from "../src/components/Flow/edge-canvas";
import fixtures from "./fixtures/flow-source.json";
import { createFlowContext } from "./helpers/flow-context";

it.each(fixtures.edges)(
  "paints pinned Native edge path $result",
  ({ result }) => {
    const ctx = createFlowContext();
    traceFlowPath(ctx, result);
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(
      [
        ...ctx.moveTo.mock.calls,
        ...ctx.lineTo.mock.calls,
        ...ctx.quadraticCurveTo.mock.calls,
        ...ctx.bezierCurveTo.mock.calls,
      ]
        .flat()
        .every(Number.isFinite)
    ).toBe(true);
  }
);
it("preserves viewport mapping, dash phase and filled arrow heads for distant nodes", () => {
  const ctx = createFlowContext();
  paintFlowEdges(
    ctx,
    {
      width: 320,
      height: 600,
      x: -2500,
      y: 100,
      zoom: 2,
      drawings: [
        {
          d: "M2500,0 C2510,0 2520,20 2530,20",
          head: "M2530,20 L2525,15 L2525,25 Z",
          stroke: "#123456",
          width: 3,
          dash: [6, 6],
          offset: -4,
        },
      ],
    },
    2,
    2
  );
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 320, 600);
  expect(ctx.translate).toHaveBeenCalledWith(-2500, 100);
  expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  expect(ctx.moveTo).toHaveBeenCalledWith(2500, 0);
  expect(ctx.setLineDash).toHaveBeenCalledWith([6, 6]);
  expect(ctx.lineDashOffset).toBe(-4);
  expect(ctx.closePath).toHaveBeenCalled();
  expect(ctx.fill).toHaveBeenCalledOnce();
  expect(ctx.restore).toHaveBeenCalledOnce();
});
