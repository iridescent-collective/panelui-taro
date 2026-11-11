import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const flatten = (value, prefix = "") =>
  Object.entries(value)
    .flatMap(([key, item]) =>
      typeof item === "string"
        ? [`${prefix}${key}`]
        : flatten(item, `${prefix}${key}.`)
    )
    .toSorted();
test("English and Chinese resources have identical nonempty translation keys", () => {
  const en = JSON.parse(
    readFileSync(new URL("locales/en.json", root), "utf-8")
  );
  const zh = JSON.parse(
    readFileSync(new URL("locales/zh-CN.json", root), "utf-8")
  );
  assert.deepEqual(flatten(en), flatten(zh));
  assert.match(zh.site.hero.title, /微信/u);
});
test("every authored English guide has a Chinese counterpart", () => {
  for (const slug of [
    "index",
    "installation",
    "example",
    "platform",
    "upgrading",
    "troubleshooting",
    ...[
      "index",
      "setup",
      "api-route",
      "chat-ui",
      "voice",
      "streaming-performance",
      "tools",
    ].map((name) => `ai/${name}`),
    ...[
      "colors",
      "theming",
      "charts",
      "fonts",
      "icons",
      "styling",
      "sizing",
    ].map((name) => `customization/${name}`),
  ]) {
    assert.ok(
      existsSync(new URL(`content/docs/${slug}.zh-CN.mdx`, root)),
      slug
    );
  }
});

test("SSR instances isolate languages and initialize synchronously", async () => {
  const { createTranslation } = await import("../lib/i18n/instance.ts");
  const en = createTranslation(
    "en",
    JSON.parse(readFileSync(new URL("locales/en.json", root), "utf-8"))
  );
  const zh = createTranslation(
    "zh-CN",
    JSON.parse(readFileSync(new URL("locales/zh-CN.json", root), "utf-8"))
  );
  assert.equal(en.isInitialized, true);
  assert.match(zh.t("hero.title"), /微信/u);
  assert.match(en.t("hero.title"), /WeChat/u);
  await zh.changeLanguage("en");
  assert.match(en.t("hero.title"), /WeChat/u);
});
test("language links retain the current document and do not double prefixes", async () => {
  const { switchLocalePath, localePath, isLocale } =
    await import("../lib/i18n/routing.ts");
  assert.equal(
    switchLocalePath("/docs/customization/icons", "zh-CN"),
    "/zh-CN/docs/customization/icons"
  );
  assert.equal(
    switchLocalePath("/zh-CN/docs/customization/icons", "en"),
    "/en/docs/customization/icons"
  );
  assert.equal(switchLocalePath("/zh-CN", "en"), "/en");
  assert.equal(
    localePath("zh-CN", "https://panelui.dev"),
    "https://panelui.dev"
  );
  assert.equal(localePath("zh-CN", "/zh-CN/docs"), "/zh-CN/docs");
  assert.equal(isLocale("fr"), false);
});
