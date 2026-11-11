"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import catalogue from "@/lib/catalogue.json";
import { localePath } from "@/lib/i18n/routing";

import { MAX_MATCHES, PreviewNotice } from "./constant";

export function ButtonsPreview() {
  const { t, i18n } = useTranslation();
  const [notice, setNotice] = useState<string>(PreviewNotice.ready);
  const [query, setQuery] = useState("");
  const results = catalogue
    .filter((item) =>
      item.name.toLowerCase().includes(query.trim().toLowerCase())
    )
    .slice(0, MAX_MATCHES);
  return (
    <div className="demo-card">
      <div className="demo-title">
        {t("buttons.title")} <span>↗</span>
      </div>
      <div className="demo-controls">
        <button
          className="filled"
          type="button"
          onClick={() => setNotice(PreviewNotice.created)}
        >
          {t("buttons.create")}
        </button>
        <button type="button" onClick={() => setNotice(PreviewNotice.ready)}>
          {t("buttons.reset")}
        </button>
      </div>
      <p className="muted" role="status">
        {t(
          notice === PreviewNotice.created ? "buttons.created" : "buttons.ready"
        )}
      </p>
      <input
        type="text"
        aria-label={t("buttons.find")}
        placeholder={t("buttons.placeholder")}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="demo-row" aria-live="polite">
        {query.trim() ? (
          <div>
            {results.length
              ? results.map((item) => (
                  <a
                    className="block py-1"
                    key={item.slug}
                    href={localePath(
                      i18n.language,
                      `/docs/components/${item.slug}`
                    )}
                  >
                    {item.name} →
                  </a>
                ))
              : t("buttons.none")}
          </div>
        ) : (
          <a href={localePath(i18n.language, "/docs/components")}>
            {t("buttons.browse")}
          </a>
        )}
      </div>
    </div>
  );
}
