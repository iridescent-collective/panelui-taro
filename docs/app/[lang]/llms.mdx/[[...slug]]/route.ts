import { source } from "@/lib/source";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lang: string; slug?: string[] }> }
) {
  const { slug, lang } = await params;
  const page = source.getPage(slug, lang);
  if (!page) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(await page.data.getText("processed"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
