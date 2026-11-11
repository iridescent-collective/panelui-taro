"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import catalogue from "@/lib/catalogue.json";
import { localePath } from "@/lib/i18n/routing";

export function ComponentDirectory() {
  const { t, i18n } = useTranslation();
  return (
    <section className="section">
      <div className="section-header">
        <h2>{t("directory.title")}</h2>
        <p>{t("directory.description")}</p>
      </div>
      <div className="component-grid">
        {catalogue.slice(0, 16).map((item) => (
          <Link
            key={item.slug}
            href={localePath(i18n.language, `/docs/components/${item.slug}`)}
          >
            {item.name} <span aria-hidden>↗</span>
          </Link>
        ))}
      </div>
      <div className="hero-actions mt-8">
        <Link
          className="secondary-link"
          href={localePath(i18n.language, "/docs/components")}
        >
          {t("directory.all", { count: catalogue.length })}
        </Link>
      </div>
    </section>
  );
}
