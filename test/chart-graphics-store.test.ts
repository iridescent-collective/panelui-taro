import { expect, it, vi } from "vitest";

import { createChartGraphicsStore } from "../src/primitives/chart-graphics-store";

it("empty graphics are valid and registration preserves order while duplicate values avoid notification", () => {
  const store = createChartGraphicsStore();
  const change = vi.fn();
  store.subscribe(change);
  store.set({ id: "empty", layer: "grid", node: undefined, order: 1 });
  store.set({ id: "first", layer: "series", node: "shape", order: 0 });
  expect(store.getSnapshot().map((entry) => entry.id)).toEqual([
    "first",
    "empty",
  ]);
  const notifications = change.mock.calls.length;
  store.set({ id: "first", layer: "series", node: "shape", order: 0 });
  expect(change).toHaveBeenCalledTimes(notifications);
  store.set({ id: "first", layer: "series", node: "shape", order: 2 });
  expect(store.getSnapshot().map((entry) => entry.id)).toEqual([
    "empty",
    "first",
  ]);
  store.remove("empty");
  expect(store.getSnapshot()).toHaveLength(1);
});
