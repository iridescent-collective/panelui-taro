import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = new URL(process.env.PANELUI_DOCS_URL ?? "http://localhost:3100");
const catalogue = JSON.parse(
  await readFile(new URL("../lib/catalogue.json", import.meta.url), "utf-8")
);
const pages = [
  "/",
  "/docs",
  "/docs/installation",
  "/docs/example",
  "/docs/platform",
  "/docs/troubleshooting",
  "/docs/upgrading",
  "/docs/components",
  ...["colors", "theming", "charts", "fonts", "icons", "styling", "sizing"].map(
    (slug) => `/docs/customization/${slug}`
  ),
  ...[
    "",
    "/setup",
    "/api-route",
    "/chat-ui",
    "/voice",
    "/streaming-performance",
    "/tools",
  ].map((slug) => `/docs/ai${slug}`),
  ...catalogue.map((item) => `/docs/components/${item.slug}`),
];
const localizedPages = ["en", "zh-CN"].flatMap((locale) =>
  pages.map((page) => `/${locale}${page === "/" ? "" : page}`)
);
const queue = localizedPages.values();
async function verifyPages() {
  const next = queue.next();
  if (next.done) {
    return;
  }
  const response = await fetch(new URL(next.value, base));
  assert.equal(response.status, 200, next.value);
  const html = await response.text();
  assert.match(html, /<h1[\s>]/u, next.value);
  assert.ok(
    html.includes(
      `<html lang="${next.value.startsWith("/zh-CN") ? "zh-CN" : "en"}"`
    ),
    next.value
  );
  await verifyPages();
}
await Promise.all(Array.from({ length: 4 }, () => verifyPages()));
await Promise.all(
  ["en", "zh-CN"].map(async (locale) => {
    const markdown = await fetch(
      new URL(`/${locale}/llms.mdx/components/button`, base)
    );
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    assert.match(text, /ButtonProps/u);
    if (locale === "zh-CN") {
      assert.match(text, /类型参考/u);
      assert.ok(!text.includes("](/docs/"));
      assert.ok(text.includes("](/zh-CN/docs/"));
    }
    const search = await fetch(
      new URL(
        `/api/search?query=${encodeURIComponent(locale === "en" ? "Button" : "图标")}&locale=${locale}`,
        base
      )
    );
    assert.equal(search.status, 200);
    const results = await search.json();
    assert.ok(results.length > 0);
    for (const result of results) {
      assert.ok(result.url.startsWith(`/${locale}/`), result.url);
    }
    const missing = await fetch(
      new URL(`/${locale}/docs/not-a-real-component`, base)
    );
    assert.equal(missing.status, 404);
  })
);
await Promise.all(
  ["/", "/docs/customization/icons", "/llms.mdx/components/button"].map(
    async (legacy) => {
      const response = await fetch(new URL(legacy, base));
      assert.equal(response.status, 200, legacy);
      assert.ok(new URL(response.url).pathname.startsWith("/en"), legacy);
    }
  )
);
console.log(
  `Verified ${localizedPages.length} localized pages, both Markdown/search locales, legacy redirects and 404 handling.`
);
