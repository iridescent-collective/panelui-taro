import { docs } from "collections/server";
import { loader } from "fumadocs-core/source";

import { i18n } from "@/lib/i18n/routing";

export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: docs.toFumadocsSource(),
});
