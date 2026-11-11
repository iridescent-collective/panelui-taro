import { View } from "@tarojs/components";

import { Text } from "../../primitives/Text";
import type { TextareaProps } from "../types";
import type { useTextareaPresentation } from "../use-presentation";

export interface TextareaFooterProps {
  textarea: TextareaProps;
  presentation: ReturnType<typeof useTextareaPresentation>;
}
export const TextareaFooter = ({
  textarea,
  presentation,
}: TextareaFooterProps) => {
  const { slots, length, limit } = presentation;
  if (
    !textarea.errorMessage &&
    !textarea.description &&
    !(textarea.showCount && limit)
  ) {
    return null;
  }
  let message = <View className="flex-1" />;
  if (textarea.description) {
    message = (
      <Text className={slots.description()}>{textarea.description}</Text>
    );
  }
  if (textarea.errorMessage) {
    message = <Text className={slots.error()}>{textarea.errorMessage}</Text>;
  }
  return (
    <View className={slots.footer()}>
      {message}
      {textarea.showCount && limit ? (
        <Text className={slots.count()}>
          {length}/{limit}
        </Text>
      ) : null}
    </View>
  );
};
