import { QUIET_ZONE } from "./constants";
import type { qrPaths } from "./geometry";

const XML_ENTITIES: Readonly<Record<string, string>> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};
const escapeXml = (value: string) =>
  value.replaceAll(/[&"'<>]/gu, (character) => XML_ENTITIES[character]);
export const qrImageSource = (
  size: number,
  paths: ReturnType<typeof qrPaths>,
  light: string,
  dark: string,
  frameInk: string,
  ballInk: string
) => {
  const grid = size + QUIET_ZONE * 2;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${grid}" height="${grid}" viewBox="0 0 ${grid} ${grid}"><rect width="${grid}" height="${grid}" rx="2.5" fill="${escapeXml(light)}"/><path d="${escapeXml(paths.body)}" fill="${escapeXml(dark)}"/><path d="${escapeXml(paths.frames)}" fill="${escapeXml(frameInk)}" fill-rule="evenodd"/><path d="${escapeXml(paths.balls)}" fill="${escapeXml(ballInk)}"/></svg>`)}`;
};
