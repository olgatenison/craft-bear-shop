// app\lib\shopify\admin.ts
import "server-only";

// Shopify Admin API configuration
const SHOPIFY_API_VERSION = "2026-10";

type ShopifyGraphQLError = {
  message: string;
  extensions?: {
    code?: string;
  };
};

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: ShopifyGraphQLError[];
};

// Universal server-side Shopify Admin GraphQL client
export async function shopifyAdminFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const rawDomain = process.env.SHOPIFY_DOMAIN;
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN;

  // Validate server environment variables
  if (!rawDomain || !adminToken) {
    throw new Error("Shopify Admin API configuration is missing");
  }

  // Normalize the Shopify domain
  const domain = rawDomain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  // Only allow Shopify store domains
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    throw new Error("Invalid Shopify store domain");
  }

  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error("Unable to connect to Shopify Admin API");
  }

  // Handle authorization and HTTP errors
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Shopify Admin API authentication failed");
    }

    if (response.status === 403) {
      throw new Error("Shopify Admin API access denied");
    }

    throw new Error(`Shopify Admin API HTTP error: ${response.status}`);
  }

  let result: ShopifyGraphQLResponse<T>;

  try {
    result = (await response.json()) as ShopifyGraphQLResponse<T>;
  } catch {
    throw new Error("Invalid response from Shopify Admin API");
  }

  // Handle GraphQL errors
  if (result.errors?.length) {
    const errorMessages = result.errors
      .map((error) => error.message)
      .join("; ");

    throw new Error(`Shopify Admin GraphQL error: ${errorMessages}`);
  }

  if (!result.data) {
    throw new Error("Shopify Admin API returned no data");
  }

  return result.data;
}
