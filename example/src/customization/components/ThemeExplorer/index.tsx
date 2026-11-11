import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Dialog } from "panelui-taro/dialog";
import { Text } from "panelui-taro/primitives/text";
import {
  useTheme,
  useThemeMode,
  useThemeTokens,
} from "panelui-taro/theme";

import { CustomizationSection } from "../Section";
import { ThemeActions } from "../ThemeActions";

export const ThemeExplorer = () => {
  const { theme } = useTheme();
  const { family, mode, toggleMode } = useThemeMode();
  const tokens = useThemeTokens();
  return (
    <>
      <CustomizationSection
        title="Family and mode"
        description="Switching light and dark keeps the current family. Sunset is the Native guide's warm custom-theme example adapted to WeChat."
      >
        <ThemeActions />
        <Text aria-label="Active theme">
          {family.name} / {mode} / {theme}
        </Text>
        <Button variant="outline" onPress={toggleMode}>
          Toggle color mode
        </Button>
      </CustomizationSection>
      <CustomizationSection
        title="Surfaces and overlay"
        description="Page content and Portal content resolve the same tokens."
      >
        <Card>
          <Card.Header>
            <Card.Title>Reading list</Card.Title>
            <Card.Description>Three saved articles</Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button>Open collection</Button>
          </Card.Footer>
        </Card>
        <Dialog>
          <Dialog.Trigger>
            <Button variant="outline">Preview themed dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>Theme preview</Dialog.Title>
            <Dialog.Description>
              {family.name} / {mode}
            </Dialog.Description>
            <Dialog.Close>
              <Button>Close preview</Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog>
      </CustomizationSection>
      <CustomizationSection
        title="Radius scale"
        description="The upstream point values are converted to rpx at the WeChat boundary."
      >
        <View className="customization-radius-row">
          {Object.entries(tokens)
            .filter(([token]) => token.startsWith("radius-"))
            .map(([token, radius]) => (
              <View
                key={token}
                className="customization-radius"
                style={{ borderRadius: `var(--panel-${token})` }}
              >
                <Text size="xs">{token}</Text>
                <Text size="xs" muted>
                  {radius}
                </Text>
              </View>
            ))}
        </View>
      </CustomizationSection>
    </>
  );
};
