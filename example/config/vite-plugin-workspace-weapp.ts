import { createRequire } from "node:module";
import path from "node:path";

import type { Plugin } from "vite";

const WEAPP_COMPONENTS_MODULE =
  "@tarojs/plugin-platform-weapp/dist/components-react";

export const vitePluginWorkspaceWeappComponents = (
  miniRoot: string
): Plugin => {
  const requireFromMini = createRequire(path.resolve(miniRoot, "package.json"));
  const componentPath = requireFromMini.resolve(WEAPP_COMPONENTS_MODULE);
  return {
    enforce: "pre",
    name: "workspace-weapp-components",
    resolveId(id) {
      if (id === WEAPP_COMPONENTS_MODULE) {
        return componentPath;
      }
      return null;
    },
    transform(code, id) {
      if (!id.includes("/tailwind-variants/dist/") || !id.endsWith(".js")) {
        return null;
      }
      if (!code.includes("input !== 0n")) {
        return null;
      }
      return {
        code: code.replaceAll("input !== 0n", 'String(input) !== "0"'),
        map: null,
      };
    },
  };
};
