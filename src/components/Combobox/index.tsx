import { View } from "@tarojs/components";

import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { ComboboxContext } from "./context";
import { ComboboxField } from "./field";
import { ComboboxList } from "./list";
import { ComboboxGroup, ComboboxItem } from "./parts";
import type { ComboboxMode, ComboboxProps } from "./types";
import { useComboboxModel } from "./use-model";

export type {
  ComboboxProps,
  ComboboxMode,
  ComboboxPresentation,
  ComboboxSelection,
  ComboboxItemProps,
  ComboboxGroupProps,
} from "./types";
const ComboboxRoot = <Mode extends ComboboxMode = "single">(
  props: ComboboxProps<Mode>
) => {
  const {
    className,
    style,
    id,
    mode: _mode,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    inputValue: _inputValue,
    defaultInputValue: _defaultInputValue,
    onInputValueChange: _onInputValueChange,
    placeholder: _placeholder,
    disabled: _disabled,
    presentation: _presentation,
    filter: _filter,
    allowCustomValue: _allowCustomValue,
    loading: _loading,
    emptyMessage: _emptyMessage,
    loadingMessage: _loadingMessage,
    clearable: _clearable,
    openOnFocus: _openOnFocus,
    onOpenChange: _onOpenChange,
    contentWidth: _contentWidth,
    offset: _offset,
    listClassName: _listClassName,
    accessibilityLabel: _accessibilityLabel,
    children: _children,
    ...nativeProps
  } = props;
  const model = useComboboxModel(props);
  const reduced = usePanelReducedMotion();
  const present = usePresence(model.open, reduced ? 0 : 120);
  return (
    <ComboboxContext.Provider
      value={{ onSelect: model.select, values: model.values }}
    >
      <View
        {...nativeProps}
        id={id}
        style={style}
        className={cn("w-full", className)}
      >
        <View id={model.measured.id}>
          <ComboboxField props={props} model={model} />
        </View>
        {present ? <ComboboxList props={props} model={model} /> : null}
      </View>
    </ComboboxContext.Provider>
  );
};
export const Combobox = Object.assign(ComboboxRoot, {
  Group: ComboboxGroup,
  Item: ComboboxItem,
});
