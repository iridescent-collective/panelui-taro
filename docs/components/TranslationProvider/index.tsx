"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ResourceLanguage } from "i18next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { createTranslation } from "@/lib/i18n/instance";
import { isLocale, switchLocalePath } from "@/lib/i18n/routing";

export function TranslationProvider({
  locale,
  resource,
  children,
}: {
  locale: string;
  resource: ResourceLanguage & { fumadocs: Record<string, string> };
  children: ReactNode;
}) {
  const [instance] = useState(() => createTranslation(locale, resource));
  const router = useRouter();
  return (
    <I18nextProvider i18n={instance}>
      <RootProvider
        i18n={{
          defaultLanguage: "en",
          hideLocale: "never",
          locale,
          locales: [
            { locale: "en", name: "English" },
            { locale: "zh-CN", name: "简体中文" },
          ],
          onLocaleChange: (next) => {
            if (isLocale(next)) {
              router.push(
                switchLocalePath(window.location.pathname, next) +
                  window.location.search +
                  window.location.hash
              );
            }
          },
          translations: resource.fumadocs,
        }}
      >
        {children}
      </RootProvider>
    </I18nextProvider>
  );
}
