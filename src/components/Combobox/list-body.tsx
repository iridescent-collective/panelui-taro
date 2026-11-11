import { View } from "@tarojs/components";

import { Text, textChildren } from "../primitives/Text";
import { Spinner } from "../Spinner";
import type { ComboboxMode, ComboboxProps } from "./types";
import type { useComboboxModel } from "./use-model";
import { comboboxVariants } from "./variants";

export const comboboxBody = <Mode extends ComboboxMode>(
  props: ComboboxProps<Mode>,
  model: ReturnType<typeof useComboboxModel<Mode>>
) => {
  const {
    loading = false,
    emptyMessage = "No matches",
    loadingMessage = "Searching",
    allowCustomValue = false,
    children,
  } = props;
  const slots = comboboxVariants();
  const isEmpty =
    model.filtered === null
      ? model.options.length === 0
      : model.filtered.length === 0;
  if (loading) {
    return (
      <View className={slots.status()}>
        <Spinner size="sm" />
        <Text size="sm" muted>
          {loadingMessage}
        </Text>
      </View>
    );
  }
  if (isEmpty) {
    return (
      <Text className="px-[24px] py-[48px] text-center text-[28px] text-[var(--panel-muted-foreground)]">
        {allowCustomValue && model.query.trim() && !model.exactMatch
          ? `Press return to add “${model.query.trim()}”`
          : emptyMessage}
      </Text>
    );
  }
  return model.filtered ?? textChildren(children);
};
