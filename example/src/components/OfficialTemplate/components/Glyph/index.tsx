import { useTheme } from "panelui-taro/theme";
import type { Activity } from "lucide-react-taro";
import type { ComponentProps } from "react";

export const Glyph = ({
  icon: Icon,
  ...props
}: ComponentProps<typeof Activity> & { icon: typeof Activity }) => {
  const { theme } = useTheme();
  return (
    <Icon {...props} color={theme.includes("dark") ? "#f5f5f5" : "#262626"} />
  );
};
