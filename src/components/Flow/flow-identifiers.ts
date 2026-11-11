const FLOW_TOKEN_PREFIX = "panelui-flow:";
export interface FlowEndpoint {
  node: string;
  handle?: string;
}
export type FlowEndpointReference = string | FlowEndpoint;
type EncodedReference =
  | ["legacy", string]
  | ["endpoint", string]
  | ["endpoint", string, string];
const encodedReference = (
  reference: FlowEndpointReference
): EncodedReference => {
  if (typeof reference === "string") {
    return ["legacy", reference];
  }
  return reference.handle === undefined
    ? ["endpoint", reference.node]
    : ["endpoint", reference.node, reference.handle];
};
const decodedReference = (
  value: unknown
): FlowEndpointReference | undefined => {
  if (!Array.isArray(value)) {
    return undefined;
  }
  if (
    value.length === 2 &&
    value[0] === "legacy" &&
    typeof value[1] === "string"
  ) {
    return value[1];
  }
  if (
    (value.length === 2 || value.length === 3) &&
    value[0] === "endpoint" &&
    typeof value[1] === "string" &&
    (value.length === 2 || typeof value[2] === "string")
  ) {
    return value.length === 2
      ? { node: value[1] }
      : { handle: value[2], node: value[1] };
  }
  return undefined;
};
const decodeToken = (token: string): unknown[] | undefined => {
  if (!token.startsWith(FLOW_TOKEN_PREFIX)) {
    return undefined;
  }
  try {
    const value: unknown = JSON.parse(token.slice(FLOW_TOKEN_PREFIX.length));
    return Array.isArray(value) ? value : undefined;
  } catch {
    return undefined;
  }
};
export const encodeFlowHandleKey = (node: string, handle: string): string =>
  FLOW_TOKEN_PREFIX + JSON.stringify(["handle", node, handle]);
export const decodeFlowHandleKey = (
  token: string
): FlowEndpoint | undefined => {
  const value = decodeToken(token);
  if (
    value?.length !== 3 ||
    value[0] !== "handle" ||
    typeof value[1] !== "string" ||
    typeof value[2] !== "string"
  ) {
    return undefined;
  }
  return { handle: value[2], node: value[1] };
};
export const encodeFlowEdgeKey = (
  from: FlowEndpointReference,
  to: FlowEndpointReference
): string =>
  FLOW_TOKEN_PREFIX +
  JSON.stringify(["edge", encodedReference(from), encodedReference(to)]);
export const decodeFlowEdgeKey = (
  token: string
):
  | {
      from: FlowEndpointReference;
      to: FlowEndpointReference;
    }
  | undefined => {
  const value = decodeToken(token);
  if (value?.length !== 3 || value[0] !== "edge") {
    return undefined;
  }
  const from = decodedReference(value[1]);
  const to = decodedReference(value[2]);
  return from === undefined || to === undefined ? undefined : { from, to };
};
export const resolveFlowEndpoint = (
  reference: FlowEndpointReference,
  nodes: readonly string[],
  handles: readonly {
    node: string;
    id: string;
  }[]
): FlowEndpoint => {
  if (typeof reference !== "string") {
    return reference;
  }
  if (nodes.includes(reference)) {
    return { node: reference };
  }
  const matches = handles.filter(
    (handle) => `${handle.node}.${handle.id}` === reference
  );
  const [match] = matches;
  return matches.length === 1 && match
    ? { handle: match.id, node: match.node }
    : { node: reference };
};
