// lib/shopify/client.ts
import type { Locale } from "@/app/[lang]/messages";

const LOCALE_TO_SHOPIFY: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  uk: "UK",
  et: "ET",
  fi: "FI",
};

// Маппинг на полные locale коды для Accept-Language заголовка
const LOCALE_TO_ACCEPT_LANGUAGE: Record<Locale, string> = {
  en: "en-US",
  ru: "ru-RU",
  uk: "uk-UA",
  et: "et-EE",
  fi: "fi-FI",
};

// Маппинг на ISO коды стран для @inContext(country:...)
const LOCALE_TO_COUNTRY: Record<Locale, string> = {
  en: "US",
  ru: "RU",
  uk: "UA",
  et: "EE",
  fi: "FI",
};

export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  revalidate = 60,
  cacheTag?: string,
  locale?: Locale
): Promise<T> {
  const endpoint = `https://${process.env.SHOPIFY_DOMAIN}/api/2024-10/graphql.json`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN!,
  };

  // Добавляем Accept-Language заголовок для локализации
  if (locale) {
    headers["Accept-Language"] = LOCALE_TO_ACCEPT_LANGUAGE[locale] || "en-US";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate, tags: cacheTag ? [cacheTag] : undefined },
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "Shopify error:",
        JSON.stringify(json.errors || res.statusText, null, 2)
      );
      console.error("Query variables:", variables);
      console.error("Locale:", locale);
      console.error("Headers:", headers);
    }
    throw new Error(JSON.stringify(json.errors || res.statusText));
  }

  return json.data as T;
}

/** Удобная обёртка: сам подставляет language и country из Locale */
export async function shopifyFetchWithLocale<T>(
  query: string,
  vars: Record<string, unknown> = {},
  lang: Locale,
  revalidate = 60
): Promise<T> {
  const language = LOCALE_TO_SHOPIFY[lang] ?? "EN";
  const country = LOCALE_TO_COUNTRY[lang] ?? "US";

  // Добавляем и language, и country в переменные для @inContext
  const variables = {
    ...vars,
    language,
    country,
  };

  // if (process.env.NODE_ENV === "development") {
  //   console.log(
  //     `[Shopify Fetch] Locale: ${lang}, Language: ${language}, Country: ${country}`
  //   );
  // }

  return shopifyFetch<T>(query, variables, revalidate, `sf:${lang}`, lang);
}

export { LOCALE_TO_SHOPIFY, LOCALE_TO_COUNTRY, LOCALE_TO_ACCEPT_LANGUAGE };
