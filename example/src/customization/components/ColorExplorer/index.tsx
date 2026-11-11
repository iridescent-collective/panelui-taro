import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useCopyToClipboard } from "panelui-taro/hooks/use-copy-to-clipboard";
import { Text } from "panelui-taro/primitives/text";
import { useThemeTokens } from "panelui-taro/theme";
import { useState } from "react";

import { CustomizationSection } from "../Section";
import { ThemeActions } from "../ThemeActions";

export const ColorExplorer = () => {
  const tokens = useThemeTokens();
  const { copy } = useCopyToClipboard();
  const [status, setStatus] = useState("Tap a color to copy its token.");
  const copyToken = async (token: string) => {
    try {
      await copy(`var(--panel-${token})`);
      setStatus(`Copied --panel-${token}`);
    } catch {
      setStatus("Could not copy. Try again.");
    }
  };
  return (
    <>
      <CustomizationSection
        title="Semantic colors"
        description="Choose a family and mode. Surface and foreground pairs change together."
      >
        <ThemeActions />
        <Text size="xs" muted>
          {status}
        </Text>
      </CustomizationSection>
      <CustomizationSection
        title="Token palette"
        description="The Native color names use the --panel- prefix in WXSS."
      >
        <View className="customization-token-grid">
          {Object.entries(tokens)
            .filter(([token]) => !token.startsWith("radius-"))
            .map(([token, color]) => (
              <Button
                key={token}
                variant="ghost"
                className="customization-token"
                accessibilityLabel={`Copy ${token} color token`}
                onPress={() => copyToken(token)}
              >
                <View
                  className="customization-swatch"
                  style={{ backgroundColor: color }}
                />
                <Text size="xs" weight="medium">
                  {token}
                </Text>
                <Text size="xs" muted>
                  {color}
                </Text>
              </Button>
            ))}
        </View>
      </CustomizationSection>
    </>
  );
};
