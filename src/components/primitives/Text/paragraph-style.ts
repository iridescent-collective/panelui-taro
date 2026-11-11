import type { CSSProperties } from "react";

export const paragraphStyle = (
  numberOfLines?: number,
  ellipsizeMode?: "head" | "middle" | "tail" | "clip"
): CSSProperties => {
  if (!numberOfLines || !Number.isFinite(numberOfLines) || numberOfLines < 1) {
    return {};
  }
  const lines = Math.floor(numberOfLines);
  const common: CSSProperties = {
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: ellipsizeMode === "clip" ? "clip" : "ellipsis",
  };
  return lines === 1
    ? { ...common, display: "block", whiteSpace: "nowrap" }
    : {
        ...common,
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: lines,
        display: "-webkit-box",
      };
};
