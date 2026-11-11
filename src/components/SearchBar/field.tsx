import { ScrollView, View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { SearchIcon, XIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Input } from "../Input";
import { Spinner } from "../Spinner";
import { CLEAR_HIT_SLOP, ICON_SIZE, TOKEN_MAX_SHARE } from "./constants";
import { captureSearchTokens, sameSearchTokens } from "./token-snapshot";
import type { SearchBarProps } from "./types";
import type { useSearchModel } from "./use-model";
import { searchBarVariants } from "./variants";

const extractInputProps = (source: SearchBarProps) => {
  const {
    shape: _shape,
    onSubmit: _onSubmit,
    debounce: _debounce,
    onDebouncedChange: _onDebouncedChange,
    onClear: _onClear,
    onCancel: _onCancel,
    isClearable: _isClearable,
    cancel: _cancel,
    cancelLabel: _cancelLabel,
    clearLabel: _clearLabel,
    loading: _loading,
    icon: _icon,
    avoidKeyboard: _avoidKeyboard,
    keyboardOffset: _keyboardOffset,
    panel: _panel,
    panelPlacement: _panelPlacement,
    panelMaxHeight: _panelMaxHeight,
    tokens: _tokens,
    onRemoveLastToken: _onRemoveLastToken,
    onKeyPress: _onKeyPress,
    onSubmitEditing: _onSubmitEditing,
    children: _children,
    defaultValue: _defaultValue,
    containerClassName: _containerClassName,
    ...props
  } = source;
  return props;
};
const SearchTokens = ({
  source,
  model,
}: {
  source: SearchBarProps;
  model: ReturnType<typeof useSearchModel>;
}) => {
  const size = source.size ?? "md";
  const slots = searchBarVariants({ size });
  const latest = useRef({ model, source });
  latest.current = { model, source };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const removeLast = async () => {
    const { current } = latest;
    if (
      current.source.disabled ||
      current.model.query.text ||
      !current.source.onRemoveLastToken
    ) {
      return;
    }
    current.model.focus.retainFocus();
    const snapshot = captureSearchTokens(current.source.tokens);
    try {
      const result = await showActionSheet({ itemList: ["Remove last token"] });
      const accepted = latest.current;
      if (
        mounted.current &&
        sameSearchTokens(snapshot, accepted.source.tokens) &&
        result.tapIndex === 0 &&
        !accepted.source.disabled &&
        !accepted.model.query.text
      ) {
        accepted.source.onRemoveLastToken?.();
        accepted.model.focus.retainFocus();
      }
    } catch {
      if (mounted.current) {
        latest.current.model.focus.retainFocus();
      }
    }
  };
  return (
    <View
      onLongPress={removeLast}
      style={{
        maxWidth: model.anchor.layout
          ? `${model.anchor.layout.width * TOKEN_MAX_SHARE * 2}rpx`
          : undefined,
      }}
    >
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        onTouchStart={model.focus.retainFocus}
      >
        <View className={slots.tokenRow()} style={{ width: "max-content" }}>
          {source.tokens}
        </View>
      </ScrollView>
    </View>
  );
};
export const SearchField = ({
  source,
  model,
}: {
  source: SearchBarProps;
  model: ReturnType<typeof useSearchModel>;
}) => {
  const size = source.size ?? "md";
  const slots = searchBarVariants({
    attached: model.panelOpen ? model.panelPlacement : "none",
    shape: source.shape,
    size,
  });
  const glyph = (
    <View key="glyph" aria-hidden style={{ pointerEvents: "none" }}>
      {source.icon ?? <SearchIcon size={ICON_SIZE[size]} />}
    </View>
  );
  const start = source.tokens ? (
    <>
      {glyph}
      <SearchTokens source={source} model={model} />
    </>
  ) : (
    glyph
  );
  const clearable = (source.isClearable ?? true) && model.query.text.length > 0;
  let end: ReactNode = null;
  if (source.loading) {
    end = <Spinner size="sm" />;
  } else if (clearable) {
    end = (
      <AnimatedPressable
        onPress={model.clear}
        disabled={source.disabled}
        hitSlop={CLEAR_HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel={source.clearLabel ?? "Clear search"}
        className={slots.clear({ className: "flex" })}
      >
        <XIcon size={ICON_SIZE[size]} />
      </AnimatedPressable>
    );
  }
  return (
    <Input
      {...extractInputProps(source)}
      ref={model.inputRef}
      id={model.fieldId}
      placeholder={source.placeholder ?? "Search"}
      returnKeyType="search"
      aria-role="searchbox"
      adjustPosition={source.avoidKeyboard ? false : source.adjustPosition}
      size={size}
      className={slots.field({ className: source.className })}
      containerClassName="w-full"
      startContent={start}
      endContent={end}
      value={model.query.text}
      onChangeText={model.query.setText}
      onFocus={model.focus.focus}
      onBlur={model.focus.blur}
      onConfirm={model.query.submit}
    />
  );
};
