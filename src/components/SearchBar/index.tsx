import { View } from "@tarojs/components";
import { forwardRef, useImperativeHandle, useMemo } from "react";

import { KeyboardAvoider } from "../../primitives/keyboard-avoider";
import { SearchCancel } from "./cancel";
import { FIELD_HEIGHT } from "./constants";
import { SearchBarContext } from "./context";
import { SearchField } from "./field";
import { SearchPanel } from "./panel";
import {
  SearchBarAction,
  SearchBarItem,
  SearchBarSection,
  SearchBarStatus,
  SearchBarToken,
} from "./parts";
import type { SearchBarHandle, SearchBarProps } from "./types";
import { useSearchModel } from "./use-model";
import { searchBarVariants } from "./variants";

export type {
  SearchBarProps,
  SearchBarPanelPlacement,
  SearchBarPanelMode,
  SearchBarSectionProps,
  SearchBarItemProps,
  SearchBarStatusProps,
  SearchBarActionProps,
  SearchBarTokenProps,
  SearchBarHandle,
  SearchBarKeyEvent,
} from "./types";
const SearchAnchor = ({
  source,
  model,
}: {
  source: SearchBarProps;
  model: ReturnType<typeof useSearchModel>;
}) => {
  const size = source.size ?? "md";
  const standalone =
    (source.cancel ?? "never") === "never" &&
    !source.avoidKeyboard &&
    !model.hasPanel;
  const slots = searchBarVariants();
  return (
    <View
      id={model.anchor.id}
      className={
        standalone
          ? source.containerClassName
          : slots.anchor({
              className:
                (source.cancel ?? "never") === "never"
                  ? "w-full"
                  : "min-w-0 flex-1",
            })
      }
      style={standalone ? undefined : { zIndex: 20 }}
    >
      <SearchPanel
        id={`${model.fieldId}-panel`}
        open={model.panelOpen}
        placement={model.panelPlacement}
        height={model.panelHeight}
        fieldHeight={model.anchor.layout?.height ?? FIELD_HEIGHT[size]}
        retainFocus={model.focus.retainFocus}
      >
        {source.children}
      </SearchPanel>
      <View className="relative" style={{ zIndex: 1 }}>
        <SearchField source={source} model={model} />
      </View>
    </View>
  );
};
const SearchRow = ({
  source,
  model,
}: {
  source: SearchBarProps;
  model: ReturnType<typeof useSearchModel>;
}) => {
  const cancelMode = source.cancel ?? "never";
  const standalone =
    cancelMode === "never" && !source.avoidKeyboard && !model.hasPanel;
  if (standalone) {
    return <SearchAnchor source={source} model={model} />;
  }
  const size = source.size ?? "md";
  const slots = searchBarVariants();
  const body = (
    <>
      <SearchAnchor source={source} model={model} />
      {cancelMode === "never" ? null : (
        <SearchCancel
          id={`${model.fieldId}-cancel`}
          size={size}
          label={source.cancelLabel ?? "Cancel"}
          always={cancelMode === "always"}
          visible={cancelMode === "always" || model.focus.focused}
          disabled={source.disabled}
          onPress={model.cancel}
        />
      )}
    </>
  );
  const className = slots.row({ className: source.containerClassName });
  return source.avoidKeyboard ? (
    <KeyboardAvoider
      id={`${model.fieldId}-row`}
      active={model.focus.focused}
      mode="lift"
      offset={source.keyboardOffset ?? 12}
      className={className}
    >
      {body}
    </KeyboardAvoider>
  ) : (
    <View className={className}>{body}</View>
  );
};
const SearchBarRoot = forwardRef<SearchBarHandle, SearchBarProps>(
  (source, ref) => {
    const model = useSearchModel(source);
    const { inputRef, focus, query } = model;
    const { end, retainFocus } = focus;
    const { setText } = query;
    useImperativeHandle(
      ref,
      () => ({
        blur: end,
        clear: () => setText(""),
        focus: () => inputRef.current?.focus(),
        isFocused: () => inputRef.current?.isFocused() ?? false,
      }),
      [inputRef, end, setText]
    );
    const size = source.size ?? "md";
    const context = useMemo(() => ({ retainFocus, size }), [size, retainFocus]);
    return (
      <SearchBarContext.Provider value={context}>
        <SearchRow source={source} model={model} />
      </SearchBarContext.Provider>
    );
  }
);
SearchBarRoot.displayName = "SearchBar";
export const SearchBar = Object.assign(SearchBarRoot, {
  Action: SearchBarAction,
  Item: SearchBarItem,
  Section: SearchBarSection,
  Status: SearchBarStatus,
  Token: SearchBarToken,
});
