"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { localePath } from "@/lib/i18n/routing";

import { CopyCommand } from "./components/CopyCommand";

export function Hero() {
  const { t, i18n } = useTranslation();
  return (
    <section className="hero">
      <Link
        href={localePath(i18n.language, "/docs/upgrading")}
        className="release-badge"
      >
        Native 0.116.0 <span>·</span> Taro & WeChat <span>→</span>
      </Link>
      <h1>{t("hero.title")}</h1>
      <p>{t("hero.description")}</p>
      <CopyCommand command="pnpm --filter mini add panelui-taro@workspace:*" />
      <div className="hero-actions">
        <Link
          className="primary-link"
          href={localePath(i18n.language, "/docs/installation")}
        >
          {t("nav.start")} <span>→</span>
        </Link>
        <Link
          className="secondary-link"
          href={localePath(i18n.language, "/docs/components")}
        >
          {t("hero.browse")}
        </Link>
      </div>
      <span className="text-fd-muted-foreground text-xs">
        {t("hero.pending")}
      </span>
    </section>
  );
}
