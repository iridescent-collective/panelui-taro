import fs from "node:fs";

import { expect, it } from "vitest";

import metadata from "../package.json";

it("publishes FileUpload as an independent component entry", () => {
  expect(metadata.exports).toHaveProperty("./file-upload");
  expect(
    fs.existsSync(
      new URL("../src/components/FileUpload/index.tsx", import.meta.url)
    )
  ).toBe(true);
});
