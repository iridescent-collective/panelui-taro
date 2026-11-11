import { PanelUIProvider } from "panelui-taro/provider";

import { ConsumerCheck } from "./components/ConsumerCheck";

export default function Index() {
  return (
    <PanelUIProvider>
      <ConsumerCheck />
    </PanelUIProvider>
  );
}
