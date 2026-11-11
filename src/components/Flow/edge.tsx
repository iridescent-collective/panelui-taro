import { useEffect, useRef } from "react";

import { useFlow } from "./context";
import { encodeFlowEdgeKey } from "./flow-identifiers";
import type { FlowEdgeProps } from "./types";

export const FlowEdge = (props: FlowEdgeProps) => {
  const { registerEdge, unregisterEdge } = useFlow("Flow.Edge");
  const key = encodeFlowEdgeKey(props.from, props.to);
  const json = JSON.stringify(props);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    registerEdge(key, latest.current);
    return () => unregisterEdge(key);
  }, [key, json, registerEdge, unregisterEdge]);
  return null;
};
