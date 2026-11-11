export interface LiveLineAccessiblePoint {
  time: number;
  value: number;
}
export interface LiveLineAccessibilityInput {
  name?: string;
  status: "loading" | "ready";
  latest: LiveLineAccessiblePoint | null;
  activePoint: LiveLineAccessiblePoint | null;
  momentum: "up" | "down" | "flat";
  windowSeconds: number;
  paused: boolean;
  now: number;
  valueOverride?: string;
  formatLatest: (value: number) => string;
  formatActive: (value: number) => string;
}
export const liveLineAccessibility = ({
  name,
  status,
  latest,
  activePoint,
  momentum,
  windowSeconds,
  paused,
  now,
  valueOverride,
  formatLatest,
  formatActive,
}: LiveLineAccessibilityInput) => {
  const parts = [name?.trim() || "Live line chart"];
  if (status === "loading") {
    parts.push("Loading");
    if (paused) {
      parts.push("Paused");
    }
    return { label: parts.join(". ") };
  }
  if (!latest) {
    parts.push("No readings");
    if (paused) {
      parts.push("Paused");
    }
    return { label: parts.join(". ") };
  }
  if (activePoint) {
    const secondsAgo = Math.max(0, Math.round((now - activePoint.time) / 1000));
    parts.push(
      `Selected value, ${formatActive(activePoint.value)}`,
      secondsAgo === 0 ? "Just now" : `${secondsAgo} seconds ago`
    );
  } else {
    parts.push(`Current value, ${valueOverride ?? formatLatest(latest.value)}`);
    const direction = { down: "falling", flat: "steady", up: "rising" }[
      momentum
    ];
    parts.push(`Trend, ${direction}`);
  }
  parts.push(`${windowSeconds}-second window`);
  if (paused) {
    parts.push("Paused");
  }
  return { label: parts.join(". ") };
};
