const XML_ENTITIES: Readonly<Record<string, string>> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};
const escapeXml = (value: string) =>
  value.replaceAll(/[&"'<>]/gu, (character) => XML_ENTITIES[character]);
export const fieldImageSource = (
  path: string,
  width: number,
  height: number,
  color: string,
  opacity = 1
) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><path d="${escapeXml(path)}" fill="${escapeXml(color)}" fill-opacity="${opacity}"/></svg>`)}`;
