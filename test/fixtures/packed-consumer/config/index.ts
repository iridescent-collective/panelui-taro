import path from "node:path";

import tailwindcss from "@tailwindcss/postcss";
import { defineConfig } from "@tarojs/cli";
import type { UserConfig } from "vite";
import { UnifiedViteWeappTailwindcssPlugin } from "weapp-tailwindcss/vite";

export default defineConfig({
  projectName: "panelui-packed-consumer",
  sourceRoot: "src",
  outputRoot: "dist",
  designWidth: 750,
  deviceRatio: { 375: 2, 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
  framework: "react",
  compiler: {
    type: "vite",
    vitePlugins: [
      {
        name: "tailwind-postcss",
        config(config: UserConfig) {
          const postcss = config.css?.postcss;
          if (typeof postcss === "object" && "plugins" in postcss)
            (postcss.plugins as unknown[]).unshift(tailwindcss());
        },
      },
      UnifiedViteWeappTailwindcssPlugin({
        rem2rpx: true,
        cssEntries: [path.resolve(__dirname, "../src/styles/tailwind.css")],
        tailwindcss: {
          v4: {
            sources: [
              {
                base: path.resolve(__dirname, ".."),
                pattern: "src/**/*.{ts,tsx}",
                negated: false,
              },
              {
                base: path.resolve(
                  __dirname,
                  "../node_modules/panelui-taro"
                ),
                pattern: "src/**/*.{ts,tsx}",
                negated: false,
              },
            ],
          },
        },
      }),
    ],
  },
  plugins: [
    require.resolve("panelui-taro/platform/taro-plugin-weapp-accessibility"),
  ],
  mini: {
    runtime: { enableMutationObserver: true },
    sassLoaderOption: { silenceDeprecations: ["legacy-js-api"] },
  },
});
