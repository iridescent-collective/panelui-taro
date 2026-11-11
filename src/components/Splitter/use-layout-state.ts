import { nextTick } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

export const useSplitterLayoutState = (
  initial: number[],
  controlled: boolean,
  onChange?: (layout: number[]) => void
) => {
  const [layout, setLayout] = useState(initial);
  const [settled, setSettled] = useState(initial);
  const current = useRef(layout);
  const owner = useRef({ controlled, initial, onChange });
  owner.current = { controlled, initial, onChange };
  const mounted = useRef(true);
  const revision = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    current.current = initial;
    setLayout(initial);
    setSettled(initial);
    revision.current += 1;
  }, [initial]);
  const update = useCallback((next: number[]) => {
    revision.current += 1;
    current.current = next;
    setLayout(next);
  }, []);
  const commit = useCallback((next: number[]) => {
    current.current = next;
    setLayout(next);
    revision.current += 1;
    if (!owner.current.controlled) {
      setSettled(next);
    }
    owner.current.onChange?.(next);
    if (owner.current.controlled) {
      const token = revision.current;
      nextTick(() => {
        if (mounted.current && token === revision.current) {
          const accepted = owner.current.initial;
          current.current = accepted;
          setLayout(accepted);
          setSettled(accepted);
        }
      });
    }
  }, []);
  const read = useCallback(() => current.current, []);
  return { commit, layout, read, settled, update };
};
