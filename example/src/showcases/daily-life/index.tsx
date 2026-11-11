import { navigateBack } from "@tarojs/taro";

import { OfficialTemplate } from "@/components/OfficialTemplate";

export default function DailyLifePage() {
  return <OfficialTemplate onBack={() => navigateBack()} />;
}
