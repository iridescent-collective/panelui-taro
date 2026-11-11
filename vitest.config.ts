import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    conditions: ["source", "module", "browser", "development"],
    alias: {
      "@tarojs/components": fileURLToPath(
        new URL("test/taro-components.tsx", import.meta.url)
      ),
      "@tarojs/runtime": fileURLToPath(
        new URL("test/taro-runtime.ts", import.meta.url)
      ),
      "@tarojs/taro": fileURLToPath(
        new URL("test/taro-api.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["test/**/*.test.{ts,tsx}"],
    setupFiles: ["./test/setup.ts"],
  },
});
