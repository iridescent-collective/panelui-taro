import { defineI18n } from "fumadocs-core/i18n";

export const locales = ["en", "zh-CN"] as const;
export type Locale = (typeof locales)[number];
export const i18n = defineI18n({
  defaultLanguage: "en",
  fallbackLanguage: null,
  hideLocale: "never",
  languages: [...locales],
});
export const isLocale = (value: string): value is Locale =>
  locales.some((locale) => locale === value);
export const localePath = (locale: string, href: string) => {
  if (!href.startsWith("/") || href.startsWith("//")) {
    return href;
  }
  if (isLocale(href.split(/[/?#]/u)[1])) {
    return href;
  }
  return `/${locale}${href === "/" ? "" : href}`;
};

export const switchLocalePath = (pathname: string, nextLocale: Locale) => {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments.splice(1, 1);
  }
  return localePath(nextLocale, segments.join("/") || "/");
};
