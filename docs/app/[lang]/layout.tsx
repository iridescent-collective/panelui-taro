import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { TranslationProvider } from "@/components/TranslationProvider";
import { resourceFor } from "@/lib/i18n/resources";
import { isLocale, locales } from "@/lib/i18n/routing";

import "../global.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    description:
      lang === "zh-CN"
        ? "PanelUI Native 的 Taro 微信小程序移植版。组合式组件、六套主题和独立微信示例。"
        : "PanelUI Native components, adapted to Taro and WeChat mini programs.",
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"
    ),
    title: {
      default:
        lang === "zh-CN"
          ? "PanelUI Taro — 微信小程序组件库"
          : "PanelUI Taro — Components for WeChat",
      template: "%s — PanelUI Taro",
    },
  };
}
export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) {
    notFound();
  }
  const resource = resourceFor(lang);
  return (
    <html lang={lang} suppressHydrationWarning>
      <body>
        <TranslationProvider key={lang} locale={lang} resource={resource}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
