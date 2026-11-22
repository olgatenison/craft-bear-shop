import { NextRequest, NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import Negotiator from "negotiator";
import { match as matchLocale } from "@formatjs/intl-localematcher";

const locales = ["en", "et", "fi", "uk", "ru"] as const;
const defaultLocale = "en";

// -------------------------------------------
// DETECT USER LANGUAGE
// -------------------------------------------

function getLocale(request: NextRequest) {
  const accept = request.headers.get("accept-language") ?? "";

  const languages = new Negotiator({
    headers: {
      "accept-language": accept,
    },
  }).languages();

  return matchLocale(languages, locales, defaultLocale);
}

// -------------------------------------------
// LANGUAGE REDIRECT
// -------------------------------------------

function localeMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // IMPORTANT:
  // Never add a language prefix to API routes.
  if (
    pathname === "/api" ||
    pathname.startsWith("/api/") ||
    pathname === "/trpc" ||
    pathname.startsWith("/trpc/")
  ) {
    return null;
  }

  // Skip Next.js internal paths.
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
    return null;
  }

  // Skip paths that already have a language.
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    return null;
  }

  // Redirect pages to the detected language.
  const locale = getLocale(request);

  const url = request.nextUrl.clone();

  url.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

// -------------------------------------------
// CLERK + LOCALE PROXY
// -------------------------------------------

export default clerkMiddleware((_auth, request) => {
  const localeRedirect = localeMiddleware(request);

  if (localeRedirect) {
    return localeRedirect;
  }

  return NextResponse.next();
});

// -------------------------------------------
// MATCHER
// -------------------------------------------

export const config = {
  matcher: [
    // Page routes, excluding static files.
    "/((?!_next|.*\\..*).*)",

    // API routes still pass through Clerk,
    // but are not redirected by localeMiddleware.
    "/(api|trpc)(.*)",
  ],
};
