import { mergeInternalComponents } from "@tarojs/shared";
import definition from "panelui-taro/platform/weapp-accessibility.json";
import type { PropsWithChildren } from "react";

import "./styles/tailwind.css";
import "./app.scss";

mergeInternalComponents(
  Object.fromEntries(
    definition.components.map((name) => [
      name,
      Object.fromEntries(
        definition.attributes.map((attribute) => [attribute, ""])
      ),
    ])
  )
);
export default function App({ children }: PropsWithChildren) {
  return children;
}
