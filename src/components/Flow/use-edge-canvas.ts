import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { paintFlowEdges } from "./edge-canvas";
import type { FlowEdgeFrame } from "./edge-canvas";

export const useFlowEdgeCanvas = (id: string, frame: FlowEdgeFrame) => {
  const surface = useCanvasSurface(
    id,
    frame.width,
    frame.height,
    (ctx, node) => {
      paintFlowEdges(
        ctx,
        frame,
        node.width / frame.width,
        node.height / frame.height
      );
    }
  );
  return !surface.unavailable && !surface.occluded;
};
