import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const options = baseOptions(lang);
  return (
    <DocsLayout
      {...options}
      tree={source.pageTree[lang]}
      nav={{ ...options.nav, mode: "top" }}
      sidebar={{
        banner: (
          <span className="platform-label">
            {lang === "zh-CN"
              ? "Taro / 微信 · Native 移植版"
              : "Taro / WeChat · Native port"}
          </span>
        ),
        collapsible: false,
        prefetch: false,
      }}
      tabs={false}
    >
      {children}
    </DocsLayout>
  );
}
