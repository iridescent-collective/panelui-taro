import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isLocale } from "@/lib/i18n/routing";

export default function proxy(request: NextRequest) {
  if (isLocale(request.nextUrl.pathname.split("/")[1])) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = `/en${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.redirect(url, 308);
}
export const config = {
  matcher: ["/((?!api|_next|.*\\.(?:png|jpg|svg|ico|txt)$).*)"],
};
