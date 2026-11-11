import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

import { Brand } from "@/components/Brand";
import { createTranslation } from "@/lib/i18n/instance";
import { resourceFor } from "@/lib/i18n/resources";
import { localePath, isLocale } from "@/lib/i18n/routing";

export function baseOptions(lang: string): BaseLayoutProps {
  const locale = isLocale(lang) ? lang : "en";
  const { t } = createTranslation(locale, resourceFor(locale));
  return {
    i18n: true,
    links: [
      {
        active: "nested-url",
        text: t("nav.components"),
        url: localePath(locale, "/docs/components"),
      },
      {
        active: "nested-url",
        text: t("nav.docs"),
        url: localePath(locale, "/docs"),
      },
      { external: true, text: t("nav.upstream"), url: "https://panelui.dev" },
      {
        secondary: true,
        text: t("nav.start"),
        type: "button",
        url: localePath(locale, "/docs/installation"),
      },
    ],
    nav: { title: <Brand />, url: localePath(locale, "/") },
  };
}
