import en from "@/locales/en.json";
import zh from "@/locales/zh-CN.json";

import type { Locale } from "./routing";

export const resources = { en, "zh-CN": zh };
export const resourceFor = (locale: Locale) => resources[locale];
