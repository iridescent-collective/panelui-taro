import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { CustomizationSection } from "../Section";

export const StylingExplorer = () => {
  const [round, setRound] = useState(false);
  return (
    <>
      <CustomizationSection
        title="className merges"
        description="An override replaces a conflicting class and keeps the component's padding, press behavior and accessibility."
      >
        <Button variant="outline" onPress={() => setRound((value) => !value)}>
          Toggle rounded override
        </Button>
        <Button
          className={round ? "rounded-full" : undefined}
          accessibilityLabel="Class merge example"
        >
          {round ? "rounded-full" : "Default radius"}
        </Button>
      </CustomizationSection>
      <CustomizationSection title="Style parts separately">
        <Card>
          <Card.Header className="pb-[16px]">
            <Card.Title>Saved collection</Card.Title>
            <Card.Description>
              Layout belongs on the part that owns it.
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <Text size="sm">
              Use the existing parts instead of rebuilding their surfaces.
            </Text>
          </Card.Content>
          <Card.Footer>
            <Button size="sm">View collection</Button>
          </Card.Footer>
        </Card>
      </CustomizationSection>
      <CustomizationSection
        title="Explicit style wins"
        description="This button merges rounded-full but sets borderRadius to zero with style, following the Native styling contract."
      >
        <View className="flex flex-col gap-[16px]">
          <Button className="rounded-full" style={{ borderRadius: "0rpx" }}>
            Square style override
          </Button>
          <Text size="xs" muted>
            Tailwind scans this package at build time. WXSS-safe class merging
            retains the WeChat escape encoding.
          </Text>
        </View>
      </CustomizationSection>
    </>
  );
};
