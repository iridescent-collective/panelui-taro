import { View } from "@tarojs/components";
import { Frame } from "panelui-taro/frame";
import type { ReactNode } from "react";

import { Text } from "../Text";

export const Section = ({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: ReactNode;
}) => (
  <Frame>
    <Frame.Header>
      <Frame.Title>{title}</Frame.Title>
      {caption ? (
        <Text size="xs" muted>
          {caption}
        </Text>
      ) : null}
    </Frame.Header>
    <Frame.Panel>
      <View className="flex min-w-0 flex-col gap-[28px] p-[32px]">
        {children}
      </View>
    </Frame.Panel>
  </Frame>
);
