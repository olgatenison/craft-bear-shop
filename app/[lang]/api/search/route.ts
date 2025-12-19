// app/[lang]/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";

// Query with language support
const SEARCH_QUERY = `
  query getProducts($first: Int!, $language: LanguageCode) @inContext(language: $language) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          vendor
          productType
          tags
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          metafields(
            identifiers: [
              { namespace: "specs", key: "country" }
              { namespace: "specs", key: "brand" }
              { namespace: "shopify", key: "beer-style" }
              { namespace: "shopify", key: "package-type" }
            ]
          ) {
            namespace
            key
            value
          }
        }
      }
    }
  }
`;

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange?: {
    minVariantPrice?: { amount: string; currencyCode: string } | null;
  } | null;
  metafields?: Array<{
    namespace: string;
    key: string;
    value: string;
  }> | null;
}

interface ShopifyResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

async function shopifyFetch<T>(
  query: string,
  variables: Record<string, number | string | null>
): Promise<T> {
  // Match your actual env variable names
  const domain = process.env.SHOPIFY_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

  console.log("🔍 Shopify Config:", {
    domain: domain ? "✓ Set" : "✗ Missing",
    token: token ? "✓ Set" : "✗ Missing",
  });

  if (!domain || !token) {
    throw new Error(
      "Missing env vars: SHOPIFY_DOMAIN or SHOPIFY_STOREFRONT_TOKEN"
    );
  }

  const url = `https://${domain}/api/2024-10/graphql.json`;
  console.log("📡 Fetching:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
      // Don't specify Accept-Language to get all data
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  console.log("📥 Response status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Shopify error response:", text);
    throw new Error(`Shopify API error (${res.status}): ${text}`);
  }

  const json = await res.json();
  console.log("📦 Response data:", JSON.stringify(json).substring(0, 200));

  if (json.errors) {
    console.error("❌ GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  }

  return json.data as T;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ lang: string }> }
) {
  console.log("🔎 Search API called");

  try {
    const params = await context.params;
    console.log("🌍 Lang:", params.lang);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();
    console.log("🔤 Query:", q);

    if (q.length < 2) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Map locale to Shopify language code
    const langMap: Record<string, string> = {
      uk: "UK",
      ru: "RU",
      en: "EN",
      fi: "FI",
      et: "ET",
    };

    const shopifyLang = langMap[params.lang] || "EN";
    console.log(
      `🌍 Searching in language: ${shopifyLang} (from URL: ${params.lang})`
    );

    // Detect if query is in Cyrillic - if yes, search in multiple languages
    const isCyrillic = /[а-яА-ЯіїєґІЇЄҐ]/.test(q);
    const hasUkrainianChars = /[іїєґІЇЄҐ]/.test(q);

    let languagesToSearch: string[] = [shopifyLang];

    // If Cyrillic query, also search in other Cyrillic languages + English
    if (isCyrillic) {
      if (hasUkrainianChars) {
        languagesToSearch = ["UK", "RU", "EN"];
      } else {
        languagesToSearch = ["RU", "UK", "EN"];
      }
      console.log("🔤 Cyrillic detected, searching in:", languagesToSearch);
    } else if (shopifyLang === "FI" || shopifyLang === "ET") {
      // For Finnish/Estonian, also search in English as fallback
      languagesToSearch = [shopifyLang, "EN"];
      console.log("🇫🇮🇪🇪 Finnish/Estonian, also searching in EN");
    }

    // Search across languages
    const allProducts = new Map<string, any>();

    for (const lang of languagesToSearch) {
      try {
        const data = await shopifyFetch<ShopifyResponse>(SEARCH_QUERY, {
          first: 50,
          language: lang,
        });

        console.log(
          `📦 Fetched ${data.products.edges.length} products for ${lang}`
        );

        // Add products to map (deduplicate by ID)
        data.products.edges.forEach((edge) => {
          if (!allProducts.has(edge.node.id)) {
            allProducts.set(edge.node.id, edge);
          }
        });
      } catch (err) {
        console.log(`⚠️ Failed to fetch for ${lang}:`, err);
      }
    }

    const edges = Array.from(allProducts.values());
    console.log("📊 Total unique products fetched:", edges.length);

    // Mapping for multi-language search (all your languages)
    const countryMap: Record<string, string[]> = {
      // Ukraine
      ukraine: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
      україна: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
      украина: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
      ukraina: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],

      // Czech Republic
      czech: [
        "чехія",
        "чехия",
        "czech",
        "czechia",
        "tšehhi",
        "tšekin tasavalta",
      ],
      чехія: [
        "чехія",
        "чехия",
        "czech",
        "czechia",
        "tšehhi",
        "tšekin tasavalta",
      ],
      czechia: [
        "чехія",
        "чехия",
        "czech",
        "czechia",
        "tšehhi",
        "tšekin tasavalta",
      ],
      tšehhi: [
        "чехія",
        "чехия",
        "czech",
        "czechia",
        "tšehhi",
        "tšekin tasavalta",
      ],

      // Germany
      germany: ["німеччина", "германия", "germany", "saksa"],
      німеччина: ["німеччина", "германия", "germany", "saksa"],
      германия: ["німеччина", "германия", "germany", "saksa"],
      saksa: ["німеччина", "германия", "germany", "saksa"],

      // Ireland
      ireland: ["ірландія", "ирландия", "ireland", "irlanti"],
      ірландія: ["ірландія", "ирландия", "ireland", "irlanti"],
      ирландия: ["ірландія", "ирландия", "ireland", "irlanti"],
      irlanti: ["ірландія", "ирландия", "ireland", "irlanti"],

      // Poland
      poland: ["польща", "польша", "poland", "puola"],
      польща: ["польща", "польша", "poland", "puola"],
      польша: ["польща", "польша", "poland", "puola"],
      puola: ["польща", "польша", "poland", "puola"],

      // Belgium
      belgium: ["бельгія", "бельгия", "belgium", "belgia"],
      бельгія: ["бельгія", "бельгия", "belgium", "belgia"],
      бельгия: ["бельгія", "бельгия", "belgium", "belgia"],
      belgia: ["бельгія", "бельгия", "belgium", "belgia"],

      // Beer styles - IPA
      ipa: ["іpa", "ипа", "ipa"],
      іpa: ["іpa", "ипа", "ipa"],

      // Beer styles - Lager
      lager: ["лагер", "lager"],
      лагер: ["лагер", "lager"],

      // Beer styles - Stout
      stout: ["стаут", "stout"],
      стаут: ["стаут", "stout"],

      // Beer styles - Ale
      ale: ["ель", "ale", "olut"],
      ель: ["ель", "ale", "olut"],
      olut: ["ель", "ale", "olut"],

      // Draft beer
      draft: ["розливне", "разливное", "draft", "hana", "tynnyri"],
      розливне: ["розливне", "разливное", "draft", "hana", "tynnyri"],
      разливное: ["розливне", "разливное", "draft", "hana", "tynnyri"],
      hana: ["розливне", "разливное", "draft", "hana", "tynnyri"],
    };

    // Get all search variations
    const getSearchVariations = (query: string): string[] => {
      const lower = query.toLowerCase();
      if (countryMap[lower]) {
        return countryMap[lower];
      }
      return [lower];
    };

    const searchVariations = getSearchVariations(q);
    console.log("🔍 Search variations:", searchVariations);

    // Filter products by title, vendor (brand), productType, tags, metafields
    const filtered = edges.filter((e) => {
      const node = e.node;

      for (const searchLower of searchVariations) {
        // Search in title
        if (node.title?.toLowerCase().includes(searchLower)) return true;

        // Search in vendor (brand/manufacturer)
        if (node.vendor?.toLowerCase().includes(searchLower)) return true;

        // Search in product type
        if (node.productType?.toLowerCase().includes(searchLower)) return true;

        // Search in tags (country, style, etc.)
        if (node.tags?.some((tag) => tag.toLowerCase().includes(searchLower)))
          return true;

        // Search in metafields (country, brand, beer-style, package-type)
        if (node.metafields && node.metafields.length > 0) {
          for (const meta of node.metafields) {
            // Check if meta and meta.value exist before accessing
            if (meta && meta.value && typeof meta.value === "string") {
              if (meta.value.toLowerCase().includes(searchLower)) {
                console.log(`✨ Found in metafield ${meta.key}:`, meta.value);
                return true;
              }
            }
          }
        }
      }

      return false;
    });

    console.log("✅ Filtered results:", filtered.length);

    const items = filtered.slice(0, 12).map((e) => ({
      id: e.node.id,
      title: e.node.title,
      handle: e.node.handle,
      image: e.node.featuredImage
        ? {
            url: e.node.featuredImage.url,
            alt: e.node.featuredImage.altText ?? null,
          }
        : undefined,
      price: e.node.priceRange?.minVariantPrice
        ? {
            amount: e.node.priceRange.minVariantPrice.amount,
            currencyCode: e.node.priceRange.minVariantPrice.currencyCode,
          }
        : undefined,
    }));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Search failed";
    console.error("❌ Search API error:", errorMessage);
    console.error("❌ Full error:", error);

    return NextResponse.json(
      {
        items: [],
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
// // app/[lang]/api/search/route.ts
// import { NextRequest, NextResponse } from "next/server";

// // Query with language support
// const SEARCH_QUERY = `
//   query getProducts($first: Int!, $language: LanguageCode) @inContext(language: $language) {
//     products(first: $first) {
//       edges {
//         node {
//           id
//           title
//           handle
//           vendor
//           productType
//           tags
//           featuredImage {
//             url
//             altText
//           }
//           priceRange {
//             minVariantPrice {
//               amount
//               currencyCode
//             }
//           }
//           metafields(
//             identifiers: [
//               { namespace: "specs", key: "country" }
//               { namespace: "specs", key: "brand" }
//               { namespace: "shopify", key: "beer-style" }
//               { namespace: "shopify", key: "package-type" }
//             ]
//           ) {
//             namespace
//             key
//             value
//           }
//         }
//       }
//     }
//   }
// `;

// interface ShopifyProduct {
//   id: string;
//   title: string;
//   handle: string;
//   vendor?: string;
//   productType?: string;
//   tags?: string[];
//   featuredImage?: { url: string; altText?: string | null } | null;
//   priceRange?: {
//     minVariantPrice?: { amount: string; currencyCode: string } | null;
//   } | null;
//   metafields?: Array<{
//     namespace: string;
//     key: string;
//     value: string;
//   }> | null;
// }

// interface ShopifyResponse {
//   products: {
//     edges: Array<{
//       node: ShopifyProduct;
//     }>;
//   };
// }

// async function shopifyFetch<T>(
//   query: string,
//   variables: Record<string, number | string | null>
// ): Promise<T> {
//   // Match your actual env variable names
//   const domain = process.env.SHOPIFY_DOMAIN;
//   const token = process.env.SHOPIFY_STOREFRONT_TOKEN;

//   console.log("🔍 Shopify Config:", {
//     domain: domain ? "✓ Set" : "✗ Missing",
//     token: token ? "✓ Set" : "✗ Missing",
//   });

//   if (!domain || !token) {
//     throw new Error(
//       "Missing env vars: SHOPIFY_DOMAIN or SHOPIFY_STOREFRONT_TOKEN"
//     );
//   }

//   const url = `https://${domain}/api/2024-10/graphql.json`;
//   console.log("📡 Fetching:", url);

//   const res = await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "X-Shopify-Storefront-Access-Token": token,
//       // Don't specify Accept-Language to get all data
//     },
//     body: JSON.stringify({ query, variables }),
//     cache: "no-store",
//   });

//   console.log("📥 Response status:", res.status);

//   if (!res.ok) {
//     const text = await res.text();
//     console.error("❌ Shopify error response:", text);
//     throw new Error(`Shopify API error (${res.status}): ${text}`);
//   }

//   const json = await res.json();
//   console.log("📦 Response data:", JSON.stringify(json).substring(0, 200));

//   if (json.errors) {
//     console.error("❌ GraphQL errors:", json.errors);
//     throw new Error(json.errors[0]?.message ?? "GraphQL error");
//   }

//   return json.data as T;
// }

// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ lang: string }> }
// ) {
//   console.log("🔎 Search API called");

//   try {
//     const params = await context.params;
//     console.log("🌍 Lang:", params.lang);

//     const { searchParams } = new URL(req.url);
//     const q = (searchParams.get("q") ?? "").trim().toLowerCase();
//     console.log("🔤 Query:", q);

//     if (q.length < 2) {
//       return NextResponse.json({ items: [] }, { status: 200 });
//     }

//     // Map locale to Shopify language code
//     const langMap: Record<string, string> = {
//       uk: "UK",
//       ru: "RU",
//       en: "EN",
//       fi: "FI",
//       et: "ET",
//     };

//     const shopifyLang = langMap[params.lang] || "EN";
//     console.log(
//       `🌍 Searching in language: ${shopifyLang} (from URL: ${params.lang})`
//     );

//     // Detect if query is in Cyrillic - if yes, search in multiple languages
//     const isCyrillic = /[а-яА-ЯіїєґІЇЄҐ]/.test(q);
//     const hasUkrainianChars = /[іїєґІЇЄҐ]/.test(q);

//     let languagesToSearch: string[] = [shopifyLang];

//     // If Cyrillic query, also search in other Cyrillic languages + English
//     if (isCyrillic) {
//       if (hasUkrainianChars) {
//         languagesToSearch = ["UK", "RU", "EN"];
//       } else {
//         languagesToSearch = ["RU", "UK", "EN"];
//       }
//       console.log("🔤 Cyrillic detected, searching in:", languagesToSearch);
//     } else if (shopifyLang === "FI" || shopifyLang === "ET") {
//       // For Finnish/Estonian, also search in English as fallback
//       languagesToSearch = [shopifyLang, "EN"];
//       console.log("🇫🇮🇪🇪 Finnish/Estonian, also searching in EN");
//     }

//     // Search across languages
//     const allProducts = new Map<string, any>();

//     for (const lang of languagesToSearch) {
//       try {
//         const data = await shopifyFetch<ShopifyResponse>(SEARCH_QUERY, {
//           first: 50,
//           language: lang,
//         });

//         console.log(
//           `📦 Fetched ${data.products.edges.length} products for ${lang}`
//         );

//         // Add products to map (deduplicate by ID)
//         data.products.edges.forEach((edge) => {
//           if (!allProducts.has(edge.node.id)) {
//             allProducts.set(edge.node.id, edge);
//           }
//         });
//       } catch (err) {
//         console.log(`⚠️ Failed to fetch for ${lang}:`, err);
//       }
//     }

//     const edges = Array.from(allProducts.values());
//     console.log("📊 Total unique products fetched:", edges.length);

//     // Mapping for multi-language search (all your languages)
//     const countryMap: Record<string, string[]> = {
//       // Ukraine
//       ukraine: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
//       україна: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
//       украина: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],
//       ukraina: ["україна", "украина", "ukraine", "ukraina", "ukrainia"],

//       // Czech Republic
//       czech: [
//         "чехія",
//         "чехия",
//         "czech",
//         "czechia",
//         "tšehhi",
//         "tšekin tasavalta",
//       ],
//       чехія: [
//         "чехія",
//         "чехия",
//         "czech",
//         "czechia",
//         "tšehhi",
//         "tšekin tasavalta",
//       ],
//       czechia: [
//         "чехія",
//         "чехия",
//         "czech",
//         "czechia",
//         "tšehhi",
//         "tšekin tasavalta",
//       ],
//       tšehhi: [
//         "чехія",
//         "чехия",
//         "czech",
//         "czechia",
//         "tšehhi",
//         "tšekin tasavalta",
//       ],

//       // Germany
//       germany: ["німеччина", "германия", "germany", "saksa"],
//       німеччина: ["німеччина", "германия", "germany", "saksa"],
//       германия: ["німеччина", "германия", "germany", "saksa"],
//       saksa: ["німеччина", "германия", "germany", "saksa"],

//       // Ireland
//       ireland: ["ірландія", "ирландия", "ireland", "irlanti"],
//       ірландія: ["ірландія", "ирландия", "ireland", "irlanti"],
//       ирландия: ["ірландія", "ирландия", "ireland", "irlanti"],
//       irlanti: ["ірландія", "ирландия", "ireland", "irlanti"],

//       // Poland
//       poland: ["польща", "польша", "poland", "puola"],
//       польща: ["польща", "польша", "poland", "puola"],
//       польша: ["польща", "польша", "poland", "puola"],
//       puola: ["польща", "польша", "poland", "puola"],

//       // Belgium
//       belgium: ["бельгія", "бельгия", "belgium", "belgia"],
//       бельгія: ["бельгія", "бельгия", "belgium", "belgia"],
//       бельгия: ["бельгія", "бельгия", "belgium", "belgia"],
//       belgia: ["бельгія", "бельгия", "belgium", "belgia"],

//       // Beer styles - IPA
//       ipa: ["іpa", "ипа", "ipa"],
//       іpa: ["іpa", "ипа", "ipa"],

//       // Beer styles - Lager
//       lager: ["лагер", "lager"],
//       лагер: ["лагер", "lager"],

//       // Beer styles - Stout
//       stout: ["стаут", "stout"],
//       стаут: ["стаут", "stout"],

//       // Beer styles - Ale
//       ale: ["ель", "ale", "olut"],
//       ель: ["ель", "ale", "olut"],
//       olut: ["ель", "ale", "olut"],

//       // Draft beer
//       draft: ["розливне", "разливное", "draft", "hana", "tynnyri"],
//       розливне: ["розливне", "разливное", "draft", "hana", "tynnyri"],
//       разливное: ["розливне", "разливное", "draft", "hana", "tynnyri"],
//       hana: ["розливне", "разливное", "draft", "hana", "tynnyri"],
//     };

//     // Get all search variations
//     const getSearchVariations = (query: string): string[] => {
//       const lower = query.toLowerCase();
//       if (countryMap[lower]) {
//         return countryMap[lower];
//       }
//       return [lower];
//     };

//     const searchVariations = getSearchVariations(q);
//     console.log("🔍 Search variations:", searchVariations);

//     // Filter products by title, vendor (brand), productType, tags, metafields
//     const filtered = edges.filter((e) => {
//       const node = e.node;

//       for (const searchLower of searchVariations) {
//         // Search in title
//         if (node.title?.toLowerCase().includes(searchLower)) return true;

//         // Search in vendor (brand/manufacturer)
//         if (node.vendor?.toLowerCase().includes(searchLower)) return true;

//         // Search in product type
//         if (node.productType?.toLowerCase().includes(searchLower)) return true;

//         // Search in tags (country, style, etc.)
//         if (node.tags?.some((tag) => tag.toLowerCase().includes(searchLower)))
//           return true;

//         // Search in metafields (country, brand, beer-style, package-type)
//         if (node.metafields && node.metafields.length > 0) {
//           for (const meta of node.metafields) {
//             // Check if meta and meta.value exist before accessing
//             if (meta && meta.value && typeof meta.value === "string") {
//               if (meta.value.toLowerCase().includes(searchLower)) {
//                 console.log(`✨ Found in metafield ${meta.key}:`, meta.value);
//                 return true;
//               }
//             }
//           }
//         }
//       }

//       return false;
//     });

//     console.log("✅ Filtered results:", filtered.length);

//     const items = filtered.slice(0, 12).map((e) => ({
//       id: e.node.id,
//       title: e.node.title,
//       handle: e.node.handle,
//       image: e.node.featuredImage
//         ? {
//             url: e.node.featuredImage.url,
//             alt: e.node.featuredImage.altText ?? null,
//           }
//         : undefined,
//       price: e.node.priceRange?.minVariantPrice
//         ? {
//             amount: e.node.priceRange.minVariantPrice.amount,
//             currencyCode: e.node.priceRange.minVariantPrice.currencyCode,
//           }
//         : undefined,
//     }));

//     return NextResponse.json({ items }, { status: 200 });
//   } catch (error: unknown) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Search failed";
//     console.error("❌ Search API error:", errorMessage);
//     console.error("❌ Full error:", error);

//     return NextResponse.json(
//       {
//         items: [],
//         error: errorMessage,
//       },
//       { status: 500 }
//     );
//   }
// }
