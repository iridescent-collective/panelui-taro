import { fileURLToPath } from "node:url";

import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
export default withMDX({
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL("../", import.meta.url)),
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:locale(en|zh-CN)/docs/native-sync",
        destination: "/:locale/docs/upgrading",
        permanent: true,
      },
      {
        source: "/docs/native-sync",
        destination: "/en/docs/upgrading",
        permanent: true,
      },
    ];
  },
});
