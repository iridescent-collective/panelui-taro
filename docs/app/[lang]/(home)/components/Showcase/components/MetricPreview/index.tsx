"use client";
import { useTranslation } from "react-i18next";

export function MetricPreview() {
  const { t } = useTranslation();
  return (
    <div className="demo-card">
      <div className="demo-title">
        {t("metric.title")} <span>{t("metric.period")}</span>
      </div>
      <div>
        <strong>8,264</strong>
        <p className="muted">{t("metric.growth")}</p>
      </div>
      <svg
        className="demo-chart"
        viewBox="0 0 260 80"
        fill="none"
        role="img"
        aria-label={t("metric.chart")}
      >
        <path
          d="M0 70 30 52 55 61 85 28 112 39 140 14 164 28 195 18 222 30 260 4"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M0 79h260" stroke="currentColor" opacity=".1" />
      </svg>
      <div className="demo-progress">
        <span />
      </div>
    </div>
  );
}
