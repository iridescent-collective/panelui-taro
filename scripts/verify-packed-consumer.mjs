import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const library = fileURLToPath(new URL("../", import.meta.url));
const project = mkdtempSync(path.join(os.tmpdir(), "panelui-packed-consumer-"));
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, CI: "1" },
    stdio: "inherit",
  });
  assert.equal(result.status, 0, `${command} ${args.join(" ")}`);
};
const version = (name) =>
  JSON.parse(
    readFileSync(
      path.join(library, "example/node_modules", name, "package.json"),
      "utf-8"
    )
  ).version;
cpSync(path.join(library, "test/fixtures/packed-consumer"), project, {
  recursive: true,
});
let archive = process.env.PANELUI_PACKAGE_ARCHIVE;
if (archive) {
  archive = realpathSync(archive);
  assert.ok(archive.endsWith(".tgz"), "Expected a packed npm archive");
  console.log(`Verifying supplied archive without repacking: ${archive}`);
} else {
  mkdirSync(path.join(project, "artifacts"));
  run(
    "pnpm",
    [
      "--config.verify-deps-before-run=false",
      "pack",
      "--pack-destination",
      path.join(project, "artifacts"),
    ],
    library
  );
  archive = path.join(
    project,
    "artifacts",
    readdirSync(path.join(project, "artifacts")).find((file) =>
      file.endsWith(".tgz")
    )
  );
}
const exampleManifest = JSON.parse(
  readFileSync(path.join(library, "example/package.json"), "utf-8")
);
const dependencies = {};
const devDependencies = {};
for (const [name] of Object.entries(exampleManifest.dependencies)) {
  if (
    [
      "panelui-taro",
      "@hugeicons/core-free-icons",
      "clsx",
      "lucide-react-taro",
    ].includes(name)
  ) {
    continue;
  }
  dependencies[name] = version(name);
}
for (const [name] of Object.entries(exampleManifest.devDependencies)) {
  if (
    [
      "@testing-library/dom",
      "@testing-library/react",
      "happy-dom",
      "oxfmt",
    ].includes(name)
  ) {
    continue;
  }
  devDependencies[name] = version(name);
}
dependencies["panelui-taro"] = `file:${archive}`;
const manifest = {
  dependencies,
  devDependencies,
  name: "panelui-packed-consumer",
  private: true,
  scripts: {
    build: "taro build --type weapp",
    postinstall: "weapp-tw patch",
    typecheck: "tsc --noEmit",
  },
  version: "0.0.0",
};
writeFileSync(
  path.join(project, "package.json"),
  `${JSON.stringify(manifest, null, 2)}\n`
);
writeFileSync(
  path.join(project, "pnpm-workspace.yaml"),
  'packages: []\nverifyDepsBeforeRun: false\nallowBuilds:\n  esbuild: true\n  "@swc/core": true\n  "@parcel/watcher": true\n  "@tarojs/binding": true\n  "@tarojs/cli": true\n  "weapp-tailwindcss": true\n  "core-js": false\n  "core-js-pure": false\n'
);
writeFileSync(
  path.join(project, ".npmrc"),
  "registry=https://registry.npmjs.org/\nverify-deps-before-run=false\n"
);
console.log(`Independent consumer: ${project}`);
run(
  "pnpm",
  ["install"],
  project
);
const consumer = createRequire(path.join(project, "package.json"));
const installed = path.dirname(
  path.dirname(
    consumer.resolve(
      "panelui-taro/platform/weapp-accessibility.json"
    )
  )
);
assert.ok(
  !realpathSync(installed).startsWith(library),
  "Package must not link to workspace source"
);
assert.equal(
  consumer.resolve("@tarojs/runtime"),
  createRequire(consumer.resolve("panelui-taro/button")).resolve(
    "@tarojs/runtime"
  ),
  "Host and library must share one Taro runtime"
);
run("pnpm", ["typecheck"], project);
run("pnpm", ["build"], project);
const dist = path.join(project, "dist");
assert.ok(
  JSON.parse(readFileSync(path.join(dist, "app.json"), "utf-8")).pages.includes(
    "pages/index/index"
  )
);
assert.match(
  readFileSync(path.join(dist, "base.wxml"), "utf-8"),
  /aria-label/u
);
const css = readdirSync(dist)
  .filter((file) => file.endsWith(".wxss"))
  .map((file) => readFileSync(path.join(dist, file), "utf-8"))
  .join("\n");
assert.match(css, /--panel-primary/u);
assert.match(css, /\.gap-4/u);
writeFileSync(
  path.join(project, "verification.json"),
  JSON.stringify(
    {
      archive,
      build: "passed",
      patches: false,
      project,
      taroRuntime: consumer.resolve("@tarojs/runtime"),
      typecheck: "passed",
    },
    null,
    2
  )
);
console.log(
  `Packed consumer verified. Open ${project} in WeChat Developer Tools.`
);
