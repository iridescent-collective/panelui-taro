import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { House, Wallet, Activity, Plane, Settings } from "lucide-react-taro";

import { SCREENS } from "../../constant";
import { Glyph } from "../Glyph";
import { Text } from "../Text";

const ICONS = [House, Wallet, Activity, Plane, Settings];
export const TemplateNavigation = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <View className="flex shrink-0 flex-row border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] px-[16px] pt-[16px] pb-[max(24px,env(safe-area-inset-bottom))]">
    {SCREENS.map((screen, index) => {
      const Icon = ICONS[index];
      return (
        <View key={screen.id} className="min-w-0 flex-1">
          <Button
            fullWidth
            size="sm"
            variant={value === screen.id ? "secondary" : "ghost"}
            accessibilityLabel={screen.label}
            onPress={() => onChange(screen.id)}
          >
            <Glyph icon={Icon} size={18} />
          </Button>
          <Text
            className="mt-[8px] block text-center"
            size="xs"
            muted={value !== screen.id}
          >
            {screen.label}
          </Text>
        </View>
      );
    })}
  </View>
);
