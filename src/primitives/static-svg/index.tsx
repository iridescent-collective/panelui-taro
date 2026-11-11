import { Image } from "@tarojs/components";
import { Children, Fragment, isValidElement } from "react";
import type { ReactNode } from "react";

const TAGS = new Set([
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "g",
  "line",
  "linearGradient",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "text",
]);
export const isStaticSvgNode = (node: ReactNode): boolean => {
  if (!isValidElement<{ children?: ReactNode }>(node)) {
    return (
      typeof node === "string" ||
      typeof node === "number" ||
      node === null ||
      node === undefined
    );
  }
  if (node.type === Fragment) {
    return Children.toArray(node.props.children).every(isStaticSvgNode);
  }
  return typeof node.type === "string" && TAGS.has(node.type);
};
const XML_ENTITIES: Readonly<Record<string, string>> = {
  '"': "&quot;",
  "&": "&amp;",
  "'": "&apos;",
  "<": "&lt;",
  ">": "&gt;",
};
const escapeXml = (value: string) =>
  value.replaceAll(/[&"'<>]/gu, (char) => XML_ENTITIES[char]);
const CASE_SENSITIVE_ATTRIBUTES = new Set([
  "viewBox",
  "preserveAspectRatio",
  "gradientUnits",
  "gradientTransform",
  "spreadMethod",
  "patternUnits",
  "patternContentUnits",
  "patternTransform",
  "clipPathUnits",
  "textLength",
  "lengthAdjust",
  "pathLength",
]);
const attributeName = (name: string) =>
  CASE_SENSITIVE_ATTRIBUTES.has(name)
    ? name
    : name.replaceAll(/[A-Z]/gu, (char) => `-${char.toLowerCase()}`);
export const serializeSvgChildren = (children: ReactNode): string =>
  Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return escapeXml(String(child));
      }
      if (
        !isValidElement<{ children?: ReactNode; [key: string]: unknown }>(child)
      ) {
        return "";
      }
      if (child.type === Fragment) {
        return serializeSvgChildren(child.props.children);
      }
      if (typeof child.type !== "string" || !TAGS.has(child.type)) {
        throw new Error("Static SVG accepts only SVG shapes and fragments");
      }
      const attrs = Object.entries(child.props)
        .filter(
          ([name]) => name !== "children" && name !== "key" && name !== "ref"
        )
        .map(([name, value]) => {
          if (
            !/^[a-zA-Z][a-zA-Z0-9-]*$/u.test(name) ||
            /^on/iu.test(name) ||
            name === "href" ||
            name === "style"
          ) {
            throw new Error(`Unsupported static SVG attribute: ${name}`);
          }
          if (typeof value !== "string" && typeof value !== "number") {
            throw new TypeError(
              `Static SVG attribute must be a string or number: ${name}`
            );
          }
          return `${attributeName(name)}="${escapeXml(String(value))}"`;
        })
        .join(" ");
      return `<${child.type} ${attrs}>${serializeSvgChildren(child.props.children)}</${child.type}>`;
    })
    .join("");
export interface StaticSvgProps {
  width: number;
  height: number;
  viewBox: string;
  children?: ReactNode;
}
export const StaticSvg = ({
  width,
  height,
  viewBox,
  children,
}: StaticSvgProps) => {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(viewBox)}">${serializeSvgChildren(children)}</svg>`;
  return (
    <Image
      aria-hidden
      mode="scaleToFill"
      src={`data:image/svg+xml,${encodeURIComponent(markup)}`}
      style={{
        display: "block",
        flexShrink: 0,
        height: `${height * 2}rpx`,
        width: `${width * 2}rpx`,
      }}
    />
  );
};
export const Circle = "circle" as const;
export const Polygon = "polygon" as const;
export const SvgText = "text" as const;
export const ClipPath = "clipPath" as const;
export const Defs = "defs" as const;
export const G = "g" as const;
export const Path = "path" as const;
export const Rect = "rect" as const;
export const SvgLine = "line" as const;
export const LinearGradient = "linearGradient" as const;
export const Stop = "stop" as const;

export const Pattern = "pattern" as const;
