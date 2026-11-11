import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
      "@tarojs/components": fileURLToPath(
        new URL("src/test/taro-components.tsx", import.meta.url)
      ),
      "@tarojs/runtime": fileURLToPath(
        new URL("../test/taro-runtime.ts", import.meta.url)
      ),
      "@tarojs/taro": fileURLToPath(
        new URL("src/test/taro-api.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
