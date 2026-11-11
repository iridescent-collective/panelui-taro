import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
} from "fumadocs-ui/layouts/notebook/page";
import { notFound } from "next/navigation";

import { localePath } from "@/lib/i18n/routing";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

type PageProps = { params: Promise<{ lang: string; slug?: string[] }> };
export default async function Page({ params }: PageProps) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) {
    notFound();
  }
  const MDX = page.data.body;
  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <div className="doc-actions">
        <MarkdownCopyButton
          markdownUrl={localePath(lang, `/llms.mdx/${page.slugs.join("/")}`)}
        />
      </div>
      <DocsBody>
        <MDX components={getMDXComponents(undefined, lang)} />
      </DocsBody>
    </DocsPage>
  );
}
export function generateStaticParams() {
  return source.generateParams();
}
export async function generateMetadata({ params }: PageProps) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  return {
    alternates: {
      canonical: localePath(
        lang,
        `/docs${slug?.length ? `/${slug.join("/")}` : ""}`
      ),
      languages: {
        en: localePath(
          "en",
          `/docs${slug?.length ? `/${slug.join("/")}` : ""}`
        ),
        "zh-CN": localePath(
          "zh-CN",
          `/docs${slug?.length ? `/${slug.join("/")}` : ""}`
        ),
      },
    },
    description: page?.data.description,
    title: page?.data.title,
  };
}
