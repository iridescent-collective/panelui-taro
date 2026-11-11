import "i18next";
import type en from "@/locales/en.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "site";
    resources: typeof en;
    enableSelector: false;
    returnNull: false;
    strictKeyChecks: true;
  }
}
