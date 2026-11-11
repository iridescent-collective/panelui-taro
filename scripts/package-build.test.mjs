import assert from "node:assert/strict";
import test from "node:test";

import { completeSpecifier, verifyPackageEntries } from "./package-build-contract.mjs";

const files = new Set([
  "dist/components/Button/index.js",
  "dist/components/Button/index.d.ts",
  "dist/lib/utils.js",
  "dist/lib/utils.d.ts",
  "dist/platform/definition.json",
  "dist/vendor/config.d.ts",
  "src/styles/panel.scss",
]);

test("completes file and directory ESM imports without bundling components", () => {
  assert.equal(
    completeSpecifier("dist/components/Button/index.js", "../../lib/utils", files),
    "../../lib/utils.js",
  );
  assert.equal(
    completeSpecifier("dist/lib/utils.js", "../components/Button", files),
    "../components/Button/index.js",
  );
  assert.equal(
    completeSpecifier("dist/lib/utils.js", "react/jsx-runtime", files),
    "react/jsx-runtime",
  );
});

test("supports declaration-only vendor imports and copied platform assets", () => {
  assert.equal(completeSpecifier("dist/vendor/lite.d.ts", "./config.js", files), "./config.js");
  assert.equal(
    completeSpecifier("dist/platform/plugin.cjs", "./definition.json", files),
    "./definition.json",
  );
  assert.throws(() => completeSpecifier("dist/vendor/lite.js", "./config.js", files), /Unresolved/);
});

test("rejects missing runtime modules instead of emitting broken import paths", () => {
  assert.throws(() => completeSpecifier("dist/lib/utils.js", "./missing", files), /Unresolved/);
});

const pkg = {
  exports: {
    "./button": {
      types: "./dist/components/Button/index.d.ts",
      default: "./dist/components/Button/index.js",
    },
  },
  typesVersions: { "*": { button: ["dist/components/Button/index.d.ts"] } },
};

test("accepts compiled public entrypoints and portable type mappings", () => {
  assert.doesNotThrow(() => verifyPackageEntries(pkg, files));
});

test("rejects a missing declaration or runtime entry in the packed archive", () => {
  for (const entry of ["dist/components/Button/index.js", "dist/components/Button/index.d.ts"]) {
    const incomplete = new Set(files);
    incomplete.delete(entry);
    assert.throws(() => verifyPackageEntries(pkg, incomplete), /Missing/);
  }
});

test("rejects source-only runtime exports and nonportable declarations", () => {
  assert.throws(
    () =>
      verifyPackageEntries(
        { exports: { "./button": "./src/button.tsx" } },
        new Set(["src/button.tsx"]),
      ),
    /compiled/,
  );
  assert.throws(
    () => completeSpecifier("dist/lib/utils.d.ts", "../../node_modules/.pnpm/react/index", files),
    /portable|Unresolved/,
  );
});

test("accepts explicit source conditions while retaining compiled defaults", () => {
  const dual = {
    exports: {
      "./button": {
        types: "./dist/components/Button/index.d.ts",
        source: "./src/components/Button/index.tsx",
        default: "./dist/components/Button/index.js",
      },
    },
  };
  assert.doesNotThrow(() =>
    verifyPackageEntries(dual, new Set([...files, "src/components/Button/index.tsx"])),
  );
});
