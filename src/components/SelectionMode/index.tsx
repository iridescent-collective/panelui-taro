import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { textChildren } from "../primitives/Text";
import { SelectionModeAction } from "./action";
import { SelectionModeBar } from "./bar";
import { FILL } from "./constants";
import { SelectionModeContext } from "./context";
import { SelectionModeGroup } from "./group";
import { SelectionModeHeader } from "./header";
import { SelectionModeIndicator } from "./indicator";
import { SelectionModeItem } from "./item";
import { SelectionModeSheet } from "./sheet";
import type { SelectionModeProps } from "./types";
import { useSelectionState } from "./use-state";

export { useSelectionMode } from "./context";
export type {
  SelectionModeProps,
  SelectionModeIndicatorProps,
  SelectionModeItemProps,
  SelectionModeGroupProps,
  SelectionModeHeaderProps,
  SelectionModeBarProps,
  SelectionModeActionProps,
  SelectionModeSheetProps,
} from "./types";
const SelectionModeRoot = (source: SelectionModeProps) => {
  const {
    values: _values,
    active: _active,
    defaultActive: _defaultActive,
    onActiveChange: _onActiveChange,
    selected: _selected,
    defaultSelected: _defaultSelected,
    onSelectedChange: _onSelectedChange,
    max: _max,
    haptics: _haptics,
    children,
    style,
    ...props
  } = source;
  const context = useSelectionState(source);
  return (
    <SelectionModeContext.Provider value={context}>
      <View
        {...props}
        style={mergeStyle({ ...FILL, position: "relative" }, style)}
      >
        {textChildren(children)}
      </View>
    </SelectionModeContext.Provider>
  );
};
SelectionModeRoot.displayName = "SelectionMode";
export const SelectionMode = Object.assign(SelectionModeRoot, {
  Action: SelectionModeAction,
  Bar: SelectionModeBar,
  Group: SelectionModeGroup,
  Header: SelectionModeHeader,
  Indicator: SelectionModeIndicator,
  Item: SelectionModeItem,
  Sheet: SelectionModeSheet,
});
