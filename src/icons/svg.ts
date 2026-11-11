import type { IconGlyph } from "./types";

const XML_ENTITIES: Readonly<Record<string, string>> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};
const escapeXml = (value: string): string =>
  value.replaceAll(/[&"'<>]/gu, (char) => XML_ENTITIES[char]);
const attributeName = (name: string): string =>
  name.replaceAll(/[A-Z]/gu, (char) => `-${char.toLowerCase()}`);

export const iconSvg = (
  glyph: IconGlyph,
  color: string,
  strokeWidth: number,
  fill: string,
  fillOpacity = 1,
  strokeOpacity = 1
): string => {
  const shapes = glyph
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .filter(([name]) => name !== "key")
        .map(([name, value]) => {
          let resolved = String(value);
          if (resolved === "currentColor" || resolved === "$resolved") {
            resolved = color;
          }
          if (resolved === "$checkColor") {
            throw new Error(
              "Badge check color must be resolved before SVG serialization"
            );
          }
          if (name === "strokeWidth") {
            resolved = String(strokeWidth);
          }
          return `${attributeName(name)}="${escapeXml(resolved)}"`;
        })
        .join(" ");
      return `<${tag} ${attributes}/>`;
    })
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${escapeXml(fill)}" stroke="${escapeXml(color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill-opacity="${fillOpacity}" stroke-opacity="${strokeOpacity}">${shapes}</svg>`;
};
