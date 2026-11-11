import { createRequire } from "node:module";

import { expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const {
  configureNativeScroll,
} = require("../src/platform/taro-plugin-weapp-native-scroll.cjs");
const original = `<template name="tmpl_0_66"><scroll-view scroll-top="{{i.p32}}" scroll-left="{{i.p31}}" scroll-into-view="{{i.p28}}" scroll-y="{{i.p35}}" bindscroll="eh" id="{{i.uid||i.sid}}" data-sid="{{i.sid}}"><template is="{{xs.a(c,item.nn,l)}}" data="{{i:item}}" wx:for="{{i.cn}}" wx:key="sid" /></scroll-view></template>`;

it("omits native position attributes only in the explicitly opted-in branch", () => {
  const template: { modifyTemplateResult?: (...args: unknown[]) => string } =
    {};
  configureNativeScroll({ buildAdapter: "weapp", template });
  const result = template.modifyTemplateResult!(original, "scroll-view", 0);
  const [native, controlled] = result.split("<block wx:else>");
  expect(native).toContain('wx:if="{{i.paneluiNativeScroll}}"');
  expect(native).not.toMatch(/scroll-(?:top|left|into-view)=/u);
  expect(controlled).toContain(
    original.match(/<scroll-view[\s\S]*<\/scroll-view>/u)![0]
  );
  for (const part of [native, controlled]) {
    expect(part).toContain('bindscroll="eh"');
    expect(part).toContain('id="{{i.uid||i.sid}}"');
    expect(part).toContain('data-sid="{{i.sid}}"');
    expect(part).toContain('wx:for="{{i.cn}}"');
  }
  expect(template.modifyTemplateResult!(original, "view", 0)).toBe(original);
});

it("chains the platform template hook once and handles every template depth", () => {
  const previous = vi.fn((result: string) => result);
  const template = {
    modifyTemplateResult: previous as (...args: unknown[]) => string,
  };
  const config = { buildAdapter: "weapp", template };
  configureNativeScroll(config);
  const installed = template.modifyTemplateResult;
  configureNativeScroll(config);
  expect(template.modifyTemplateResult).toBe(installed);
  for (const depth of [0, 1, 14, 15]) {
    const result = template.modifyTemplateResult(
      original,
      "scroll-view",
      depth
    );
    expect(result.match(/i\.paneluiNativeScroll/gu)).toHaveLength(1);
  }
  expect(previous).toHaveBeenCalledTimes(4);
});

it("leaves other platforms' templates alone", () => {
  const previous = vi.fn((result: string) => result);
  const template = { modifyTemplateResult: previous };
  configureNativeScroll({ buildAdapter: "h5", template });
  expect(template.modifyTemplateResult).toBe(previous);
});

it("the native-only entry leaves component schemas and aliases unchanged", () => {
  const plugin = require("../src/platform/taro-plugin-weapp-native-scroll.cjs");
  let configure: ((value: unknown) => void) | undefined;
  plugin({
    modifyComponentConfig: (callback: typeof configure) => {
      configure = callback;
    },
  });
  const internalComponents = { ScrollView: { "scroll-top": "" }, View: {} };
  const aliases = { "scroll-view": { scrollTop: "p32" } };
  const template = { internalComponents, componentsAlias: aliases };
  const original = JSON.stringify(template);
  configure!({ config: { buildAdapter: "weapp", template } });
  expect(JSON.stringify({ internalComponents, componentsAlias: aliases })).toBe(
    original
  );
});
