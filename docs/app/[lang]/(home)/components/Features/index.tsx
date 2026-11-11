"use client";
import { useTranslation } from "react-i18next";

import { featureKeys } from "./constant";

export function Features() {
  const { t } = useTranslation();
  return (
    <div className="feature-section">
      <section className="section">
        <div className="section-header">
          <h2>{t("features.title")}</h2>
          <p>{t("features.description")}</p>
        </div>
        <div className="feature-grid">
          {featureKeys.map((key) => (
            <article className="feature" key={key}>
              <div className="stat">{t(`features.items.${key}.stat`)}</div>
              <h3>{t(`features.items.${key}.title`)}</h3>
              <p>{t(`features.items.${key}.description`)}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
