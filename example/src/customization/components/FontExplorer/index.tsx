import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import {
  getRegisteredThemeFonts,
  loadThemeFonts,
  setThemeFonts,
  useTheme,
} from "panelui-taro/theme";
import type { ThemeFontSources } from "panelui-taro/theme";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { CustomizationSection } from "../Section";

const FONT_SOURCE =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/pacifico/Pacifico-Regular.ttf";
const FONT = { family: "PanelPacifico", source: FONT_SOURCE };
const FONT_SOURCES: ThemeFontSources = {
  bold: FONT,
  medium: FONT,
  normal: FONT,
  semibold: FONT,
};
export const FontExplorer = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(
    "System fonts. Custom fonts load only when you request them."
  );
  const load = async () => {
    setLoading(true);
    try {
      await loadThemeFonts(theme, FONT_SOURCES);
      setStatus(`Pacifico loaded for ${theme}.`);
    } catch {
      setStatus(
        "Font download failed. The current font is unchanged. Check HTTPS, CORS and the resource host, then retry."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <CustomizationSection
        title="Load a font face"
        description="The Native guide's font tokens are normal, medium, semibold, bold and mono. WeChat loads network fonts with loadFontFace; each registered face can serve its own token."
      >
        <Button onPress={load} loading={loading}>
          Load Pacifico sample
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onPress={() => {
            setThemeFonts(theme, {});
            setStatus("System fonts restored.");
          }}
        >
          Restore system fonts
        </Button>
        <Text size="sm" aria-label="Font loading status">
          {status}
        </Text>
      </CustomizationSection>
      <CustomizationSection
        title="Weight tokens"
        description="A downloaded face carries its own weight. Unconfigured tokens keep the platform's normal weight behavior."
      >
        <Text weight="normal">Normal / A quick brown fox 012345</Text>
        <Text weight="medium">Medium / A quick brown fox 012345</Text>
        <Text weight="semibold">Semibold / A quick brown fox 012345</Text>
        <Text weight="bold">Bold / A quick brown fox 012345</Text>
        <Typography.Code>font-mono / src/theme/use-theme.ts</Typography.Code>
        <View className="flex flex-row gap-[16px]">
          <Button size="sm">Button label</Button>
          <Button
            size="sm"
            variant="outline"
            onPress={() => {
              setThemeFonts(theme, {
                ...getRegisteredThemeFonts(theme),
                mono: "Courier New",
              });
              setStatus("Monospace token set to Courier New.");
            }}
          >
            Set monospace token
          </Button>
        </View>
      </CustomizationSection>
      <CustomizationSection
        title="WeChat limits"
        description="Use a downloadable HTTPS TTF or WOFF file with CORS enabled. The sample is Pacifico from the Google Fonts repository. Configure a resource host for release builds; this page does not upload or publish fonts."
      >
        <Text size="sm" muted>
          Network-loaded fonts are not assumed to work in native Canvas or maps.
          A simulator load does not establish device support. Chinese text falls
          back when a font has no matching glyphs.
        </Text>
      </CustomizationSection>
    </>
  );
};
