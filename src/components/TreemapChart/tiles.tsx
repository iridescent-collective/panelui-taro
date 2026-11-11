import { Canvas } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { compactNumber } from "../../lib/chart";
import { useChartTween } from "../../primitives/chart-tween";
import { Rect } from "../../primitives/static-svg";
import { useCanvasTap } from "../../primitives/use-canvas-tap";
import { useChart, useTreemapReveal, useTreemapGraphic } from "./context";
import type { TreemapChartTilesProps, TreemapTile } from "./types";

export const tileProgress = (
  progress: number,
  window: { from: number; to: number }
) =>
  Math.min(
    1,
    Math.max(0, (progress - window.from) / (window.to - window.from || 1))
  );
export const tileFrame = (
  tile: TreemapTile,
  window: { from: number; to: number },
  progress: number,
  dim: number,
  dimOpacity: number
) => {
  const clamped = tileProgress(progress, window);
  const grown = 1 - (1 - clamped) * (1 - clamped) * (1 - clamped);
  const width = tile.width * grown;
  const height = tile.height * grown;
  return {
    height,
    opacity: tile.strength * (1 - dim * (1 - dimOpacity)),
    width,
    x: tile.x + (tile.width - width) / 2,
    y: tile.y + (tile.height - height) / 2,
  };
};
const Tile = ({
  tile,
  index,
  dimOpacity,
}: {
  tile: TreemapTile;
  index: number;
  dimOpacity: number;
}) => {
  const { cornerRadius, windows, activeIndex } = useChart("TreemapChart tile");
  const grow = useTreemapReveal();
  const reduced = usePanelReducedMotion();
  const tween = useChartTween(0);
  useEffect(() => {
    const target = activeIndex >= 0 && activeIndex !== index ? 1 : 0;
    if (reduced) {
      tween.setImmediate(target);
    } else {
      tween.timingTo(target, 180);
    }
  }, [activeIndex, index, reduced, tween.setImmediate, tween.timingTo]);
  const dim = useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
  const window = windows[index];
  const node = useMemo(
    () =>
      window && tile.width > 0 && tile.height > 0 ? (
        <Rect
          {...tileFrame(tile, window, grow, dim, dimOpacity)}
          fill={tile.color}
          rx={Math.max(
            0,
            Math.min(cornerRadius, tile.width / 2, tile.height / 2)
          )}
          aria-label={`${tile.label}, ${compactNumber(tile.value)}, ${Math.round(tile.share * 100)} percent`}
        />
      ) : null,
    [tile, window, grow, dim, dimOpacity, cornerRadius]
  );
  useTreemapGraphic(node);
  return null;
};
export const TreemapChartTiles = Object.assign(
  ({ dimOpacity = 0.35 }: TreemapChartTilesProps) => {
    const { tiles, windows, status, activeIndex, setActiveIndex, reveal } =
      useChart("TreemapChart.Tiles");
    const tapReset = useMemo(() => ({ status, tiles }), [tiles, status]);
    const pointer = useCanvasTap(
      (x, y) => {
        if (status === "loading") {
          return null;
        }
        for (let i = 0; i < tiles.length; i += 1) {
          const tile = tiles[i];
          const window = windows[i];
          if (!window) {
            continue;
          }
          const frame = tileFrame(tile, window, reveal.value, 0, 1);
          if (
            frame.width > 0 &&
            frame.height > 0 &&
            x >= frame.x &&
            x <= frame.x + frame.width &&
            y >= frame.y &&
            y <= frame.y + frame.height
          ) {
            return i;
          }
        }
        return null;
      },
      (index) => setActiveIndex(activeIndex === index ? -1 : index),
      tapReset
    );
    if (status === "loading" || !tiles.length) {
      return null;
    }
    return (
      <>
        {tiles.map((tile, index) => (
          <Tile
            key={`${tile.label}-${index}`}
            tile={tile}
            index={index}
            dimOpacity={dimOpacity}
          />
        ))}
        <Canvas
          type="2d"
          aria-hidden
          className="panel-treemap-pointer absolute inset-0 h-full w-full"
          {...pointer}
        />
      </>
    );
  },
  { displayName: "TreemapChart.Tiles", slot: "svg" as const }
);
