import { mergeInternalComponents } from "@tarojs/shared";
import definition from "panelui-taro/platform/weapp-accessibility.json";

const patch: Record<string, Record<string, string>> = {};
for (const component of definition.components) {
  patch[component] = Object.fromEntries(
    definition.attributes.map((attribute) => [attribute, ""])
  );
}
mergeInternalComponents(patch);
