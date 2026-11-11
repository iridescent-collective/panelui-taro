"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ButtonsPreview } from "./components/ButtonsPreview";
import { MetricPreview } from "./components/MetricPreview";
import { PreferencesPreview } from "./components/PreferencesPreview";
import { families } from "./constant";

export function Showcase() {
  const { t } = useTranslation();
  const [family, setFamily] = useState(families[0].name);
  return (
    <section className="section showcase" data-family={family}>
      <div className="section-header">
        <h2>{t("showcase.title")}</h2>
        <p>{t("showcase.description")}</p>
      </div>
      <div
        role="radiogroup"
        aria-label={t("showcase.family")}
        className="theme-picker"
      >
        {families.map((item) => (
          <button
            key={item.name}
            type="button"
            role="radio"
            aria-checked={family === item.name}
            onClick={() => setFamily(item.name)}
          >
            <span className="swatch" style={{ background: item.color }} />
            {item.name}
          </button>
        ))}
      </div>
      <div className="demo-grid">
        <ButtonsPreview />
        <MetricPreview />
        <PreferencesPreview />
      </div>
      <p className="demo-caption">{t("showcase.caption")}</p>
    </section>
  );
}
