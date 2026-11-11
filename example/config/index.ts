import path from "node:path";

import tailwindcss from "@tailwindcss/postcss";
import { defineConfig } from "@tarojs/cli";
import type { UserConfigExport } from "@tarojs/cli";
import type { Plugin, UserConfig } from "vite";
import { UnifiedViteWeappTailwindcssPlugin } from "weapp-tailwindcss/vite";

import { vitePluginWorkspaceWeappComponents } from "./vite-plugin-workspace-weapp";

export default defineConfig<"vite">(() => {
  const outputRoot = path.relative(
    path.resolve(__dirname, ".."),
    path.resolve(__dirname, "..", process.env.TARO_OUTPUT_ROOT || "dist")
  );
  const baseConfig: UserConfigExport<"vite"> = {
    alias: {
      "@": path.resolve(__dirname, "..", "src"),
    },

    compiler: {
      type: "vite",
      vitePlugins: [
        vitePluginWorkspaceWeappComponents(path.resolve(__dirname, "..")),
        {
          name: "panelui-example-source-boundary",
          config() {
            return { resolve: { conditions: ["source"] } };
          },
          configResolved(config) {
            if (!config.resolve.conditions.includes("source")) {
              throw new Error("Example source export condition was not applied");
            }
          },
          moduleParsed(module) {
            const compiled = path.resolve(__dirname, "../../dist") + path.sep;
            if (module.id.startsWith(compiled) && module.id.endsWith(".js")) {
              this.error(`Example loaded a second, compiled library graph: ${module.id}`);
            }
          },
        } satisfies Plugin,
        {
          config(config: UserConfig) {
            const postcss = config.css?.postcss;
            if (
              typeof postcss === "object" &&
              postcss !== null &&
              "plugins" in postcss
            ) {
              (postcss.plugins as unknown[]).unshift(tailwindcss());
            }
          },
          name: "postcss-config-loader-plugin",
        },
        UnifiedViteWeappTailwindcssPlugin({
          cssEntries: [
            path.resolve(__dirname, "..", "src", "styles", "tailwind.css"),
          ],
          rem2rpx: true,
          tailwindcss: {
            v4: {
              sources: [
                {
                  base: path.resolve(__dirname, ".."),
                  negated: false,
                  pattern: "src/**/*.{ts,tsx}",
                },
                {
                  base: path.resolve(__dirname, "../.."),
                  negated: false,
                  pattern: "src/**/*.{ts,tsx}",
                },
              ],
            },
          },
        }),
      ],
    },

    defineConstants: {
      __PANELUI_AI_API_URL__: JSON.stringify(
        process.env.TARO_APP_PANELUI_AI_API_URL || ""
      ),
    },
    designWidth: 750,

    deviceRatio: {
      375: 2,
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },

    framework: "react",

    mini: {
      postcss: {
        cssModules: {
          config: {
            generateScopedName: "[name]__[local]___[hash:base64:5]",
            namingPattern: "module",
          },
          enable: true,
        },
        pxtransform: {
          config: {},
          enable: true,
        },
      },
      runtime: { enableMutationObserver: true },
      sassLoaderOption: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },

    modifyViteConfig(viteConfig: UserConfig) {
      if (process.env.TARO_OUTPUT_ROOT) {
        viteConfig.cacheDir = path.resolve(
          __dirname,
          "..",
          outputRoot,
          "../cache/vite"
        );
      }
      viteConfig.css ??= {};
      const { css } = viteConfig;
      css.preprocessorOptions ??= {};
      const { preprocessorOptions } = css;
      for (const lang of ["scss", "sass"] as const) {
        const opts = (preprocessorOptions[lang] ??= {}) as Record<
          string,
          unknown
        >;
        opts.silenceDeprecations = ["legacy-js-api"];
      }
    },

    outputRoot,

    plugins: [
      "@tarojs/plugin-generator",
      require.resolve("panelui-taro/platform/taro-plugin-weapp-accessibility"),
    ],

    projectName: "panelui-example",

    sourceRoot: "src",
  };
  return baseConfig;
});
