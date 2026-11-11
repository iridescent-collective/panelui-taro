import { View } from "@tarojs/components";
import { useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon, SearchIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { InputGroup } from "../InputGroup";
import { Popover } from "../Popover";
import { Text, textChildren } from "../primitives/Text";
import { SelectContext } from "./context";
import { NativeSelect } from "./native";
import { collectOptions, filterOptions } from "./options";
import { SelectItem, SelectGroup } from "./parts";
import { SelectSurface } from "./surfaces";
import type { SelectProps, SelectSize } from "./types";
import { useSelectController } from "./use-select-controller";
import { selectVariants } from "./variants";

export { useSelectSearch } from "./context";
export type {
  SelectProps,
  SelectItemProps,
  SelectGroupProps,
  SelectSize,
  SelectPresentation,
  SelectSheetProps,
} from "./types";
const CHEVRON_SIZE: Record<SelectSize, number> = {
  lg: 18,
  md: 16,
  sm: 14,
  xl: 20,
  xs: 12,
};
const normalizeSelectProps = ({
  placeholder = "Select an option",
  size = "md",
  presentation = "sheet",
  searchable = false,
  searchPlaceholder = "Search",
  emptyMessage = "No matches",
  nativeAppearance = "menu",
  ...props
}: SelectProps) => ({
  ...props,
  emptyMessage,
  nativeAppearance,
  placeholder,
  presentation,
  searchPlaceholder,
  searchable,
  size,
});
const SelectBody = (props: SelectProps) => {
  const {
    children,
    value,
    valueLabel,
    onValueChange,
    placeholder,
    disabled,
    size,
    presentation,
    searchable,
    searchPlaceholder,
    emptyMessage,
    native,
    nativeAppearance,
    className,
    triggerClassName,
    valueClassName,
    placeholderClassName,
    searchClassName,
    searchInputClassName,
    searchContainerClassName,
    emptyClassName,
  } = normalizeSelectProps(props);
  const { query, setQuery, close, toggle, open, triggerId } =
    useSelectController(props);
  const reduced = usePanelReducedMotion();
  const iconColor = useThemeToken("muted-foreground");
  const { options, fullyDeclared } = useMemo(
    () => collectOptions(children),
    [children]
  );
  const selectedLabel =
    valueLabel ?? options.find((option) => option.value === value)?.label;
  const context = useMemo(
    () => ({
      onSelect: (next: string) => {
        onValueChange(next);
        close();
      },
      query,
      setQuery,
      value,
    }),
    [value, query, onValueChange, close]
  );
  const filtered = useMemo(() => {
    const needle = searchable ? query.trim().toLowerCase() : "";
    return needle ? filterOptions(children, needle) : null;
  }, [children, query, searchable]);
  const slots = selectVariants({
    disabled: Boolean(disabled),
    presentation,
    size,
  });
  if (
    native &&
    fullyDeclared &&
    options.length > 0 &&
    options.every((option) => !option.disabled)
  ) {
    return (
      <NativeSelect
        value={value}
        disabled={disabled}
        nativeAppearance={nativeAppearance}
        onValueChange={onValueChange}
        options={options}
      />
    );
  }
  const search = searchable ? (
    <View className={slots.search({ className: searchClassName })}>
      <InputGroup>
        <InputGroup.Prefix isDecorative>
          <SearchIcon size={18} color={iconColor} />
        </InputGroup.Prefix>
        <InputGroup.Input
          variant="filled"
          size="sm"
          className={searchInputClassName}
          containerClassName={searchContainerClassName}
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
          returnKeyType="search"
        />
      </InputGroup>
    </View>
  ) : null;
  const optionList =
    filtered && filtered.seen > 0 && filtered.kept.length === 0 ? (
      <Text className={slots.empty({ className: emptyClassName })}>
        {emptyMessage}
      </Text>
    ) : (
      textChildren(filtered?.kept ?? children)
    );
  return (
    <SelectContext.Provider value={context}>
      <View className={className}>
        <AnimatedPressable
          id={triggerId}
          accessibilityRole="combobox"
          accessibilityState={{ disabled: Boolean(disabled), expanded: open }}
          disabled={disabled}
          hitSlop={size === "xs" ? { bottom: 7, top: 7 } : undefined}
          onPress={toggle}
          className={slots.trigger({ className: triggerClassName })}
        >
          <Text
            className={
              selectedLabel
                ? slots.triggerLabel({ className: valueClassName })
                : slots.placeholder({ className: placeholderClassName })
            }
          >
            {selectedLabel || placeholder}
          </Text>
          <View
            style={{
              transform: `rotate(${open ? 180 : 0}deg)`,
              transition: reduced ? "none" : "transform 160ms ease",
            }}
          >
            <ChevronDownIcon size={CHEVRON_SIZE[size]} color={iconColor} />
          </View>
        </AnimatedPressable>
        {presentation === "inline" ? (
          <SelectSurface
            props={props}
            open={open}
            close={close}
            context={context}
            search={search}
            options={optionList}
          />
        ) : null}
      </View>
      {presentation === "inline" ? null : (
        <SelectSurface
          props={props}
          open={open}
          close={close}
          context={context}
          search={search}
          options={optionList}
        />
      )}
    </SelectContext.Provider>
  );
};
const SelectRoot = (props: SelectProps) => (
  <Popover>
    <SelectBody {...props} />
  </Popover>
);
export const Select = Object.assign(SelectRoot, {
  Group: SelectGroup,
  Item: SelectItem,
});
