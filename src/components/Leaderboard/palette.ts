import { withColorAlpha } from "../../lib/color";
import { useThemeToken } from "../../theme/use-theme";

export const useLeaderboardPalette = () => {
  const primary = useThemeToken("primary");
  const foreground = useThemeToken("foreground");
  const background = useThemeToken("background");
  const primaryForeground = useThemeToken("primary-foreground");
  return {
    background,
    bar: {
      1: primary,
      2: withColorAlpha(primary, 0.4),
      3: withColorAlpha(primary, 0.16),
    },
    foreground,
    primary,
    primaryForeground,
  };
};
