import { Image } from "@tarojs/components";
import { usePlotLayer } from "panelui-taro/plot";
import { createElement, Children, isValidElement } from "react";
import type { ReactNode, CSSProperties } from "react";

import { serializeSvgChildren } from "../../../src/primitives/static-svg";

export const Circle = (props: Record<string, unknown>) =>
  createElement("circle", props);

export const Path = (props: Record<string, unknown>) => {
  usePlotLayer(createElement("path", props));
  return null;
};
export const SvgXml = ({
  xml,
  width,
  height,
  style,
}: {
  xml: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  viewBox?: string;
}) => (
  <Image
    src={`data:image/svg+xml,${encodeURIComponent(xml)}`}
    mode="aspectFit"
    style={{
      height: typeof height === "number" ? `${height * 2}rpx` : height,
      width: typeof width === "number" ? `${width * 2}rpx` : width,
      ...style,
    }}
  />
);
const serialize = (nodes: ReactNode): ReactNode =>
  Children.map(nodes, (child) =>
    isValidElement<{ children?: ReactNode }>(child) &&
    (child.type === Path || child.type === Circle)
      ? createElement(child.type === Circle ? "circle" : "path", child.props)
      : child
  );
export default function Svg({
  children,
  width,
  height,
  viewBox,
  ..._props
}: {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  [key: string]: unknown;
}) {
  const bounds =
    viewBox ?? `0 0 ${Number(width) || 24} ${Number(height) || 24}`;
  return (
    <SvgXml
      xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds}">${serializeSvgChildren(serialize(children))}</svg>`}
      width={width}
      height={height}
    />
  );
}
