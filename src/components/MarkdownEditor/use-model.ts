import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Ref } from "react";

import type { InputHandle } from "../Input/types";
import { ACTIONS } from "./actions";
import { continueList } from "./transforms";
import type { EditorSelection } from "./transforms";
import type {
  MarkdownEditorAction,
  MarkdownEditorContextValue,
  MarkdownEditorHandle,
  MarkdownEditorMode,
  MarkdownEditorProps,
} from "./types";

export const useMarkdownEditorModel = (
  props: MarkdownEditorProps,
  ref: Ref<MarkdownEditorHandle>,
  view: React.RefObject<unknown>
) => {
  const {
    value: valueProp,
    defaultValue = "",
    onValueChange,
    mode: modeProp,
    defaultMode = "write",
    onModeChange,
    disabled = false,
    continueLists = true,
  } = props;
  const field = useRef<InputHandle | null>(null);
  const focusAfterAttach = useRef(false);
  const focusAfterFormat = useRef(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = valueProp ?? internalValue;
  const [internalMode, setInternalMode] =
    useState<MarkdownEditorMode>(defaultMode);
  const mode = modeProp ?? internalMode;
  const selection = useRef<EditorSelection>({ end: 0, start: 0 });
  const [pending, setPending] = useState<EditorSelection>();
  const valueRef = useRef(value);
  valueRef.current = value;
  const [active, setActive] = useState<ReadonlySet<MarkdownEditorAction>>(
    () => new Set()
  );
  const commit = useCallback(
    (next: string) => {
      if (valueProp === undefined) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [valueProp, onValueChange]
  );
  const setMode = useCallback(
    (next: MarkdownEditorMode) => {
      if (modeProp === undefined) {
        setInternalMode(next);
      }
      onModeChange?.(next);
    },
    [modeProp, onModeChange]
  );
  const readActive = useCallback(
    (text: string, currentSelection: EditorSelection) => {
      const next = new Set<MarkdownEditorAction>();
      for (const key of Object.keys(ACTIONS) as MarkdownEditorAction[]) {
        if (ACTIONS[key].isActive?.(text, currentSelection)) {
          next.add(key);
        }
      }
      setActive((current) =>
        current.size === next.size && [...next].every((key) => current.has(key))
          ? current
          : next
      );
    },
    []
  );
  const run = useCallback(
    (action: MarkdownEditorAction) => {
      const result = ACTIONS[action].apply(valueRef.current, selection.current);
      valueRef.current = result.text;
      selection.current = result.selection;
      commit(result.text);
      focusAfterFormat.current = field.current !== null;
      setPending(result.selection);
      readActive(result.text, result.selection);
    },
    [commit, readActive]
  );
  useEffect(() => {
    if (pending && focusAfterFormat.current) {
      focusAfterFormat.current = false;
      field.current?.focus();
    }
  }, [pending]);
  const onChangeText = useCallback(
    (next: string, cursor?: number) => {
      const previous = valueRef.current;
      if (continueLists && next.length === previous.length + 1) {
        let at = 0;
        while (at < previous.length && previous[at] === next[at]) {
          at += 1;
        }
        if (next[at] === "\n") {
          const result = continueList(previous, { end: at, start: at });
          if (result) {
            valueRef.current = result.text;
            selection.current = result.selection;
            commit(result.text);
            setPending(result.selection);
            readActive(result.text, result.selection);
            return result.text;
          }
        }
      }
      valueRef.current = next;
      if (
        typeof cursor === "number" &&
        Number.isFinite(cursor) &&
        cursor >= 0
      ) {
        const position = Math.min(cursor, next.length);
        const caret = { end: position, start: position };
        selection.current = caret;
        setPending(caret);
        readActive(next, caret);
      } else {
        setPending(undefined);
      }
      commit(next);
      return next;
    },
    [continueLists, commit, readActive]
  );
  const registerField = useCallback((next: InputHandle | null) => {
    field.current = next;
    if (next && focusAfterAttach.current) {
      focusAfterAttach.current = false;
      next.focus();
    }
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      apply: run,
      blur: () => {
        focusAfterAttach.current = false;
        field.current?.blur();
      },
      focus: () => {
        setMode("write");
        if (field.current) {
          field.current.focus();
        } else {
          focusAfterAttach.current = true;
        }
      },
      getActive: () => [...active],
      getSelection: () => ({ ...selection.current }),
      setMode,
      setSelection: (next) => {
        selection.current = next;
        setPending(next);
        readActive(valueRef.current, next);
      },
      get view() {
        return view.current;
      },
    }),
    [view, run, active, readActive, setMode]
  );
  return useMemo<MarkdownEditorContextValue>(
    () => ({
      active,
      clearPending: () => setPending(undefined),
      disabled,
      mode,
      onChangeText,
      pending,
      registerField,
      run,
      setMode,
      setSelection: (next) => {
        selection.current = next;
        readActive(valueRef.current, next);
      },
      value,
    }),
    [
      value,
      mode,
      setMode,
      run,
      active,
      pending,
      readActive,
      onChangeText,
      registerField,
      disabled,
    ]
  );
};
