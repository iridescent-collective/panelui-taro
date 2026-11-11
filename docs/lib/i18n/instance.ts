import { createInstance } from "i18next";
import type { ResourceLanguage } from "i18next";

export function createTranslation(locale: string, resource: ResourceLanguage) {
  const instance = createInstance();
  instance.init({
    defaultNS: "site",
    fallbackLng: "en",
    initAsync: false,
    interpolation: { escapeValue: false },
    lng: locale,
    ns: ["site"],
    resources: { [locale]: resource },
    returnNull: false,
    supportedLngs: ["en", "zh-CN"],
  });
  return instance;
}
