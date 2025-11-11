// lib/shopify/client.ts
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60
): Promise<T> {
  const endpoint = `https://${process.env.SHOPIFY_DOMAIN}/api/2024-10/graphql.json`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token":
        process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || res.statusText));
  }
  return json.data as T;
}
