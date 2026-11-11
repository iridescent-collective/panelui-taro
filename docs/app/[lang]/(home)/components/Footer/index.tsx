"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { localePath } from "@/lib/i18n/routing";

export function Footer() {
  const { t, i18n } = useTranslation();
  return (
    <footer className="site-footer">
      <span>{t("footer.attribution")}</span>
      <span>
        {t("footer.source")} <a href="https://panelui.dev">PanelUI</a>.{" "}
        <Link href={localePath(i18n.language, "/docs/platform")}>
          {t("footer.platform")}
        </Link>
      </span>
    </footer>
  );
}
