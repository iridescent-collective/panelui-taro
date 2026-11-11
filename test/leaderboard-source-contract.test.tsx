// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Leaderboard, rankEntries } from "../src/components/Leaderboard";
import { podiumHeights } from "../src/components/Leaderboard/leaderboard-rank";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

const entries = [
  { change: -1, id: "c", name: "Cora Chen", value: 80 },
  { change: 2, id: "a", name: "Alice Ray", value: 100 },
  { change: 0, id: "b", name: "Bob Lee", value: 80 },
  { id: "d", name: "Dani Kim", subtitle: "Team A", value: 60 },
  { id: "e", name: "Evan Fox", value: 50 },
];
it("source ranking is stable, shares competition ranks, filters nonfinite scores and never mutates data", () => {
  const data = [...entries, { id: "bad", name: "Bad", value: Number.NaN }];
  const ranked = rankEntries(data);
  expect(ranked.map((item) => [item.entry.id, item.rank, item.tied])).toEqual([
    ["a", 1, false],
    ["c", 2, true],
    ["b", 2, true],
    ["d", 4, false],
    ["e", 5, false],
  ]);
  expect(rankEntries(data, "asc").map((item) => item.entry.id)).toEqual([
    "e",
    "d",
    "c",
    "b",
    "a",
  ]);
  expect(data[0].id).toBe("c");
  expect(podiumHeights([80, 100, 80], [2, 1, 2], "value")).toEqual([
    0.88, 1, 0.88,
  ]);
  expect(podiumHeights([80, 100, 80], [2, 1, 2], "rank")).toEqual([
    0.74, 1, 0.74,
  ]);
  expect(podiumHeights([0, 0], [1, 1], "value")).toEqual([1, 1]);
});
it("podium visual seats are 2-1-3 positions with real tie ranks and accessible press results", () => {
  const press = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Leaderboard
        data={entries}
        unit="points"
        limit={3}
        onPressEntry={press}
      />
    </PanelUIProvider>
  );
  const buttons = screen.getAllByRole("button");
  expect(buttons.map((node) => node.getAttribute("aria-label"))).toEqual([
    "Rank 2, tied, Cora Chen, 80 points, down 1 place",
    "Rank 1, Alice Ray, 100 points, up 2 places",
    "Rank 2, tied, Bob Lee, 80 points, no change",
  ]);
  fireEvent.click(buttons[0]);
  expect(press).toHaveBeenCalledExactlyOnceWith(entries[0], 2);
});
it("limit pins the hidden viewer once with its true rank and custom formatted metric", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Leaderboard
        data={entries}
        podium="none"
        limit={2}
        highlightId="e"
        formatValue={(value) => `${value}m`}
        unit="distance"
      />
    </PanelUIProvider>
  );
  const rows = screen.getAllByRole("group");
  expect(rows).toHaveLength(3);
  expect(rows[2].getAttribute("aria-label")).toBe(
    "Rank 5, Evan Fox, 50m distance"
  );
  expect(readTaroStyle(rows[2])).toContain("backgroundColor");
  expect(screen.queryByText("Dani Kim")).toBeNull();
});
it("cards and empty mode preserve source surface geometry and caller content", () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Leaderboard data={entries} podium="cards" limit={3} />
    </PanelUIProvider>
  );
  const rows = screen.getAllByRole("group");
  expect(rows[1].className).toContain("pt-[40px]");
  expect(readTaroStyle(rows[1])).toContain('"borderColor":"#262626"');
  expect(rows[0].className).toContain("panel-card");
  tree.rerender(
    <PanelUIProvider>
      <Leaderboard
        data={[{ id: "bad", name: "Bad", value: Number.POSITIVE_INFINITY }]}
        emptyText="No ranked data"
      />
    </PanelUIProvider>
  );
  expect(screen.getByText("No ranked data")).toBeTruthy();
  expect(screen.getByText("No ranked data").parentElement?.className).toContain(
    "border-dashed"
  );
  expect(screen.queryByRole("list")).toBeNull();
});
it("podium bars grow with source stagger and stop scheduled work when unmounted", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <Leaderboard data={entries} limit={3} podiumHeight={100} />
      </PanelUIProvider>
    );
    expect(vi.getTimerCount()).toBe(3);
    act(() => vi.advanceTimersByTime(1000));
    const bars = tree.container.querySelectorAll('[class*="rounded-t-"]');
    expect(bars).toHaveLength(3);
    expect(readTaroStyle(bars[1] as HTMLElement)).toContain(
      '"height":"200rpx"'
    );
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("nonzero movement is announced only in the aggregate row label", () => {
  render(
    <PanelUIProvider>
      <Leaderboard data={entries} podium="none" limit={1} />
    </PanelUIProvider>
  );
  const row = screen.getByRole("group");
  const movement = row.querySelector('[class*="min-w-[80px]"]');
  expect(movement?.getAttribute("aria-hidden")).toBe("true");
  expect(row.getAttribute("aria-label")).toContain("up 2 places");
});
