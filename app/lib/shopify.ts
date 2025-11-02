const endpoint = `https://${process.env.SHOPIFY_DOMAIN}/api/2024-10/graphql.json`;

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token":
        process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
    // кэшируй как хочешь:
    next: { revalidate: 60 },
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || res.statusText));
  }
  return json.data as T;
}
