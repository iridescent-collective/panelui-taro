import defaults from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { localePath } from "@/lib/i18n/routing";

export function getMDXComponents(
  components?: MDXComponents,
  locale = "en"
): MDXComponents {
  return {
    ...defaults,
    a: ({ href, ...props }) => (
      <Link href={localePath(locale, href ?? "#")} {...props} />
    ),
    ...components,
  };
}
