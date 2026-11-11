"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { localePath } from "@/lib/i18n/routing";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  return (
    <main className="not-found">
      <h1>{t("notFound.title")}</h1>
      <p>{t("notFound.description")}</p>
      <Link href={localePath(i18n.language, "/docs")}>
        {t("notFound.back")}
      </Link>
    </main>
  );
}
