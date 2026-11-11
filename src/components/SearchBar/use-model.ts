import {
  Children,
  isValidElement,
  useCallback,
  useId,
  useMemo,
  useRef,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import type { InputHandle } from "../Input";
import { searchPanelHeight } from "./panel-math";
import type { SearchBarProps } from "./types";
import { useSearchFocus } from "./use-focus";
import { useSearchText } from "./use-text";

const hasSearchPanel = (children: SearchBarProps["children"]) =>
  Children.toArray(children).some((child) => isValidElement(child));
export const useSearchModel = (props: SearchBarProps) => {
  const inputRef = useRef<InputHandle>(null);
  const generated = `panelui-search-${useId().replaceAll(":", "")}`;
  const fieldId = props.id ?? generated;
  const query = useSearchText(props);
  const focus = useSearchFocus(props, inputRef, fieldId);
  const { height } = useWindowMetrics();
  const hasPanel = hasSearchPanel(props.children);
  const mode = props.panel ?? "focus";
  const panelOpen =
    !props.disabled &&
    mode !== "never" &&
    hasPanel &&
    (mode === "always" || focus.focused);
  const dependencies = useMemo(
    () => ({
      className: props.className,
      containerClassName: props.containerClassName,
      inputStyle: props.style,
      keyboard: focus.keyboardHeight,
      panelOpen,
      size: props.size,
    }),
    [
      props.className,
      props.style,
      props.containerClassName,
      panelOpen,
      focus.keyboardHeight,
      props.size,
    ]
  );
  const anchor = useElementLayout(
    true,
    dependencies,
    `${fieldId}-anchor`,
    false
  );
  const panelPlacement = props.panelPlacement ?? "top";
  const panelHeight = searchPanelHeight({
    anchor: anchor.layout,
    avoiding: props.avoidKeyboard ?? false,
    cap: props.panelMaxHeight,
    height,
    keyboard: focus.keyboardHeight,
    offset: props.keyboardOffset ?? 12,
    placement: panelPlacement,
  });
  const latest = useRef({ focus, props, query });
  latest.current = { focus, props, query };
  const clear = useCallback(() => {
    const { current } = latest;
    if (current.props.disabled) {
      return;
    }
    current.query.setText("");
    current.props.onClear?.();
    current.focus.retainFocus();
  }, []);
  const cancel = useCallback(() => {
    const { current } = latest;
    if (current.props.disabled) {
      return;
    }
    current.query.setText("");
    current.focus.end();
    current.props.onCancel?.();
  }, []);
  return {
    anchor,
    cancel,
    clear,
    fieldId,
    focus,
    hasPanel,
    inputRef,
    panelHeight,
    panelOpen,
    panelPlacement,
    query,
  };
};
