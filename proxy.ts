// proxy.ts (ROOT)

// proxy.ts (ROOT)

import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

const locales = ["en", "et", "fi", "uk", "ru"] as const;
const defaultLocale = "en";

function getLocale(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";
  const languages = new Negotiator({
    headers: { "accept-language": accept },
  }).languages();
  return matchLocale(languages, locales, defaultLocale);
}

// наша логика локали
function localeMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return null;

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

// ⬇️ главный экспорт, который ожидает Next 16
export default clerkMiddleware((_auth, request) => {
  const localeRedirect = localeMiddleware(request);
  if (localeRedirect) return localeRedirect;

  return NextResponse.next();
});

export const config = {
  matcher: [
    // пропускаем статику и внутренности next
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // и всегда запускаем для API-роутов
    "/(api|trpc)(.*)",
  ],
};
