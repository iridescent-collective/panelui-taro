import { useEffect, useRef, useState } from "react";

import { addCandidates, reconcileMarkedTag, splitOn } from "./state";
import type { MarkedTag } from "./state";
import type { TagInputProps } from "./types";

export const useTags = (props: TagInputProps) => {
  const [ownTags, setOwnTags] = useState(props.defaultValue ?? []);
  const [ownText, setOwnText] = useState("");
  const tags = props.value ?? ownTags;
  const text = props.inputValue ?? ownText;
  const [marked, setMarked] = useState<MarkedTag | null>(null);
  const latest = useRef({ props, tags, text });
  latest.current = { props, tags, text };
  useEffect(
    () => setMarked((current) => reconcileMarkedTag(current, tags)),
    [tags]
  );
  const setText = (next: string) => {
    const owner = latest.current;
    if (owner.props.inputValue === undefined) {
      owner.text = next;
      setOwnText(next);
    }
    owner.props.onInputValueChange?.(next);
  };
  const commit = (next: string[]) => {
    const owner = latest.current;
    if (owner.props.value === undefined) {
      owner.tags = next;
      setOwnTags(next);
    }
    owner.props.onValueChange?.(next);
  };
  const addTags = (candidates: string[]) => {
    const owner = latest.current;
    const result = addCandidates(candidates, owner.tags, owner.props);
    for (const { tag, reason } of result.rejected) {
      owner.props.onReject?.(tag, reason);
    }
    if (result.added) {
      commit(result.next);
    }
    return result.added;
  };
  const input = (next: string) => {
    setMarked(null);
    const delimiters = latest.current.props.delimiters ?? [","];
    if (delimiters.some((entry) => entry && next.includes(entry))) {
      const parts = splitOn(next, delimiters);
      const trailing = parts.pop() ?? "";
      const added = addTags(parts);
      setText(trailing);
      return added;
    }
    setText(next);
    return false;
  };
  const submit = () => {
    const added = addTags([latest.current.text]);
    if (added) {
      setText("");
    }
    return added;
  };
  const blur = () => {
    setMarked(null);
    const behavior = latest.current.props.blurBehavior ?? "add";
    if (behavior === "clear") {
      setText("");
      return false;
    }
    return behavior === "add" ? submit() : false;
  };
  const removeAt = (index: number) => {
    const owner = latest.current;
    if (index < 0 || index >= owner.tags.length) {
      return false;
    }
    commit(owner.tags.filter((_, position) => position !== index));
    return true;
  };
  const backspace = () => {
    const owner = latest.current;
    if (owner.text.length > 0 || owner.tags.length === 0) {
      return false;
    }
    const armed = reconcileMarkedTag(marked, owner.tags);
    if (armed) {
      setMarked(null);
      return removeAt(armed.index);
    }
    const index = owner.tags.length - 1;
    const tag = owner.tags[index];
    if (tag !== undefined) {
      setMarked({ index, tag });
    }
    return false;
  };
  const clear = () => {
    setText("");
    setMarked(null);
    commit([]);
  };
  return {
    backspace,
    blur,
    clear,
    input,
    marked,
    removeAt,
    submit,
    tags,
    text,
  };
};
export type TagsState = ReturnType<typeof useTags>;
