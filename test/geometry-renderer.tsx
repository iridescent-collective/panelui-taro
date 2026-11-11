import { vi } from "vitest";

// Source-parity fixtures inspect shape geometry, independently of the platform
// painter. Serialize those shapes only in this test adapter. Native Canvas
// painting and lifecycle are exercised without this adapter in canvas-graphics.
vi.mock("../src/primitives/canvas-graphics", async () => {
  const { StaticSvg } = await import("../src/primitives/static-svg");
  return { CanvasGraphics: StaticSvg, GraphicSnapshot: StaticSvg };
});
