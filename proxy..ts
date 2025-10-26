// proxy.ts (ROOT)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Уже есть префикс локали?
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return; // ничего не делаем

  // Добавляем префикс локали
  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

// Важно: настроить matcher для Proxy
export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // не трогаем статику
    // Если хочешь, чтобы работало и на API, добавь следующую строку:
    // "/api/:path*",
  ],
};
