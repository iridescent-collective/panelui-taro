import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { verifyPackageEntries } from "./package-build-contract.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const temporary = process.env.PANELUI_PACKAGE_ARCHIVE
  ? undefined
  : mkdtempSync(path.join(os.tmpdir(), "panelui-package-"));
try {
  let archive = process.env.PANELUI_PACKAGE_ARCHIVE;
  if (!archive) {
    execFileSync("pnpm", ["pack", "--ignore-scripts", "--pack-destination", temporary], {
      cwd: root,
      stdio: "pipe",
    });
    const archives = readdirSync(temporary).filter((file) => file.endsWith(".tgz"));
    assert.equal(archives.length, 1);
    archive = path.join(temporary, archives[0]);
  }
  const files = new Set(
    execFileSync("tar", ["-tzf", archive], { encoding: "utf8" })
      .trim()
      .split("\n")
      .map((file) => file.replace(/^package\//, "")),
  );
  const packed = JSON.parse(
    execFileSync("tar", ["-xOf", archive, "package/package.json"], { encoding: "utf8" }),
  );
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  assert.equal(packed.name, pkg.name);
  assert.equal(packed.version, pkg.version);
  verifyPackageEntries(packed, files);
  for (const file of [
    "src/styles/panel.scss",
    "LICENSE",
    "LICENSE.weapp-core-escape",
    "LICENSES/react-native-reanimated-MIT.txt",
    "dist/vendor/tailwind-variants/LICENSE",
    "dist/platform/weapp-accessibility.json",
  ])
    assert.ok(files.has(file), `Missing source, asset or attribution: ${file}`);
  for (const file of files) {
    assert.ok(
      !/(?:^|\/)(?:node_modules|test|tests|\.env)(?:\/|$)/.test(file),
      `Unexpected published file: ${file}`,
    );
  }
  for (const section of ["dependencies", "peerDependencies"]) {
    for (const version of Object.values(packed[section] ?? {}))
      assert.ok(!/^(?:catalog|workspace):/.test(version), "Unresolved workspace dependency");
  }
  console.log(
    `Verified packed exports, declarations, source styles and licenses: ${files.size} files.`,
  );
} finally {
  if (temporary) rmSync(temporary, { recursive: true, force: true });
}
