"use client";
import { useTranslation } from "react-i18next";

import { localePath } from "@/lib/i18n/routing";

export function PreferencesPreview() {
  const { t, i18n } = useTranslation();
  return (
    <div className="demo-card">
      <div className="demo-title">
        {t("preferences.title")} <span>⌘</span>
      </div>
      <strong className="preferences-heading">
        {t("preferences.line1")}
        <br />
        {t("preferences.line2")}
      </strong>
      <div className="demo-row">
        <label>
          <input type="checkbox" defaultChecked />
          {t("preferences.notifications")}
        </label>
        <span className="muted">{t("preferences.push")}</span>
      </div>
      <div className="demo-row">
        <label>
          <input type="checkbox" />
          {t("preferences.weekly")}
        </label>
        <span className="muted">{t("preferences.optional")}</span>
      </div>
      <a
        href={localePath(i18n.language, "/docs/customization/theming")}
        className="secondary-link"
      >
        {t("preferences.explore")}
      </a>
    </div>
  );
}
