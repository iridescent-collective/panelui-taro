import type { CSSProperties } from "react";

const styleText = (style: CSSProperties) =>
  Object.entries(style)
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${key.replaceAll(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`)}:${value}`
    )
    .join(";");
export const mergeStyle = (
  base: CSSProperties,
  override?: CSSProperties | string
): CSSProperties | string =>
  typeof override === "string"
    ? `${styleText(base)};${override}`
    : { ...base, ...override };
export const mergeStyleAfter = (
  override: CSSProperties | string | undefined,
  computed: CSSProperties
): CSSProperties | string =>
  typeof override === "string"
    ? `${override};${styleText(computed)}`
    : { ...override, ...computed };
