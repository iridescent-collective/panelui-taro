import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import type { SupportArticleProps } from "./types";
import { supportVariants } from "./variants";

export const SupportArticle = forwardRef<
  ComponentRef<typeof View>,
  SupportArticleProps
>(({ className, icon, title, collection, onPress, onClick, ...props }, ref) => {
  const { article, channelText } = supportVariants();
  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="link"
      accessibilityLabel={collection ? `${title}, in ${collection}` : title}
      disabled={!onPress && !onClick}
      onClick={onClick ?? onPress}
      className={article({ className })}
      {...props}
    >
      {icon ? <View className="shrink-0">{icon}</View> : null}
      <View className={channelText()}>
        <Text size="sm" numberOfLines={2}>
          {title}
        </Text>
        {collection ? (
          <Text size="xs" muted numberOfLines={1}>
            {collection}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
});
SupportArticle.displayName = "Support.Article";
