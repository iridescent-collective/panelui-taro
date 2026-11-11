import { View } from "@tarojs/components";
import { useContext } from "react";

import { XIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { Spinner } from "../Spinner";
import { SearchBarContext } from "./context";
import type {
  SearchBarActionProps,
  SearchBarItemProps,
  SearchBarSectionProps,
  SearchBarStatusProps,
  SearchBarTokenProps,
} from "./types";
import { searchBarVariants } from "./variants";

export const SearchBarSection = ({
  className,
  label,
  children,
  ...props
}: SearchBarSectionProps) => {
  const slots = searchBarVariants();
  return (
    <View
      {...props}
      className={slots.section({
        className: `flex flex-col ${className ?? ""}`,
      })}
    >
      {label ? (
        <Text aria-role="heading" className={slots.sectionLabel()}>
          {label}
        </Text>
      ) : null}
      {children}
    </View>
  );
};
SearchBarSection.displayName = "SearchBar.Section";
export const SearchBarItem = ({
  className,
  leading,
  trailing,
  description,
  selected,
  children,
  onPressIn,
  ...props
}: SearchBarItemProps) => {
  const slots = searchBarVariants({ selected: !!selected });
  const search = useContext(SearchBarContext);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!props.disabled, selected: !!selected }}
      onPressIn={(event) => {
        search?.retainFocus();
        onPressIn?.(event);
      }}
      pressScale={1}
      pressOpacity={0.6}
      hitSlop={{ bottom: 2, top: 2 }}
      {...props}
      className={slots.item({ className })}
    >
      {leading}
      <View className="min-w-0 flex-1">
        <Text numberOfLines={1} className={slots.itemLabel()}>
          {children}
        </Text>
        {description ? (
          <Text size="sm" muted numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
      {trailing}
    </AnimatedPressable>
  );
};
SearchBarItem.displayName = "SearchBar.Item";
export const SearchBarStatus = ({
  className,
  loading = false,
  children,
  ...props
}: SearchBarStatusProps) => (
  <View
    aria-role="text"
    {...props}
    className={searchBarVariants().status({ className })}
  >
    {loading ? <Spinner size="sm" /> : null}
    <Text size="sm" muted>
      {children}
    </Text>
  </View>
);
SearchBarStatus.displayName = "SearchBar.Status";
export const SearchBarAction = ({
  className,
  children,
  onPressIn,
  ...props
}: SearchBarActionProps) => {
  const search = useContext(SearchBarContext);
  return (
    <AnimatedPressable
      accessibilityRole="button"
      hitSlop={12}
      pressScale={1}
      pressOpacity={0.5}
      onPressIn={(event) => {
        search?.retainFocus();
        onPressIn?.(event);
      }}
      {...props}
      className={className}
    >
      {children}
    </AnimatedPressable>
  );
};
SearchBarAction.displayName = "SearchBar.Action";
export const SearchBarToken = ({
  className,
  leading,
  onRemove,
  removeLabel,
  children,
  ...props
}: SearchBarTokenProps) => {
  const search = useContext(SearchBarContext);
  const slots = searchBarVariants({ size: search?.size ?? "md" });
  const label = typeof children === "string" ? children : undefined;
  return (
    <View {...props} className={slots.token({ className })}>
      {leading}
      <Text numberOfLines={1} className={slots.tokenLabel()}>
        {children}
      </Text>
      {onRemove ? (
        <SearchBarAction
          accessibilityLabel={
            removeLabel ?? (label ? `Remove ${label}` : "Remove")
          }
          onPress={onRemove}
          className={slots.tokenRemove({ className: "flex" })}
        >
          <XIcon size={12} />
        </SearchBarAction>
      ) : null}
    </View>
  );
};
SearchBarToken.displayName = "SearchBar.Token";
