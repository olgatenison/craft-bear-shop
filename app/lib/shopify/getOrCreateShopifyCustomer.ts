// app/lib/shopify/getOrCreateShopifyCustomer.ts

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// Використовуємо існуючі змінні з .env
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN!;

interface UserMetadata {
  shopifyCustomerId?: string;
  shopifySyncedAt?: string;
  [key: string]: unknown;
}

interface ShopifyCustomer {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
}

interface ShopifyCustomersSearchResponse {
  customers: ShopifyCustomer[];
}

interface ShopifyCustomerCreateResponse {
  customer: ShopifyCustomer;
}

interface ShopifyCustomerResponse {
  customer: ShopifyCustomer;
}

interface ShopifyOrder {
  id: string | number;
  order_number: number;
  total_price: string;
  currency: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
}

interface ShopifyOrdersResponse {
  orders: ShopifyOrder[];
}

// Витягуємо числовий ID з GID формату Shopify
function extractNumericId(gid: string | number): string {
  if (typeof gid === "number") return String(gid);
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : String(gid);
}

async function shopifyAdminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  console.log("🔵 Shopify API Request:", path);

  if (!SHOPIFY_DOMAIN) {
    throw new Error("SHOPIFY_DOMAIN не встановлено в .env");
  }
  if (!SHOPIFY_ADMIN_TOKEN) {
    throw new Error("APP_API_SECRET_KEY не встановлено в .env");
  }

  const url = `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/${path}`;
  console.log("🔵 Full URL:", url);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      ...(options.headers || {}),
    },
  });

  console.log("🔵 Response status:", res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Shopify error", res.status, errorText);
    throw new Error(`Shopify request failed: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  console.log("✅ Shopify response:", JSON.stringify(data, null, 2));

  return data as T;
}

export async function getOrCreateShopifyCustomer(): Promise<string | null> {
  try {
    console.log("🟢 START: getOrCreateShopifyCustomer");

    const user = await currentUser();
    if (!user || !user.primaryEmailAddress) {
      console.error("❌ No user or email");
      return null;
    }

    const email = user.primaryEmailAddress.emailAddress;
    console.log("🟢 User email:", email);
    console.log("🟢 User ID:", user.id);

    const metadata = user.publicMetadata as UserMetadata;
    console.log("🟢 Current metadata:", metadata);

    // 1. Якщо вже є зв'язка в metadata — перевіряємо чи існує в Shopify
    if (metadata.shopifyCustomerId) {
      console.log("🟡 Found existing Shopify ID:", metadata.shopifyCustomerId);
      try {
        const customerId = extractNumericId(metadata.shopifyCustomerId);
        await shopifyAdminFetch<ShopifyCustomerResponse>(
          `customers/${customerId}.json`
        );
        console.log("✅ Customer exists in Shopify");
        return customerId;
      } catch (error) {
        console.warn("⚠️ Shopify customer not found, will recreate", error);
      }
    }

    // 2. Шукаємо customer в Shopify по email
    console.log("🔍 Searching for customer by email...");
    const searchResult =
      await shopifyAdminFetch<ShopifyCustomersSearchResponse>(
        `customers/search.json?query=email:${encodeURIComponent(email)}`
      );

    let shopifyCustomerId: string;

    if (searchResult.customers && searchResult.customers.length > 0) {
      console.log("✅ Found existing customer in Shopify");
      shopifyCustomerId = extractNumericId(searchResult.customers[0].id);
      console.log("✅ Customer ID:", shopifyCustomerId);
    } else {
      // 3. Створюємо нового customer в Shopify
      console.log("🆕 Creating new customer in Shopify...");
      const created = await shopifyAdminFetch<ShopifyCustomerCreateResponse>(
        `customers.json`,
        {
          method: "POST",
          body: JSON.stringify({
            customer: {
              email,
              first_name: user.firstName ?? "",
              last_name: user.lastName ?? "",
              verified_email: true,
              note: `Clerk User ID: ${user.id}`,
              tags: ["clerk-synced"],
            },
          }),
        }
      );

      shopifyCustomerId = extractNumericId(created.customer.id);
      console.log("✅ Created new customer:", shopifyCustomerId);
    }

    // 4. Зберігаємо ID в publicMetadata Clerk-користувача
    console.log("💾 Saving to Clerk metadata...");
    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      publicMetadata: {
        ...metadata,
        shopifyCustomerId,
        shopifySyncedAt: new Date().toISOString(),
      },
    });

    console.log("✅ SUCCESS: Shopify customer ID:", shopifyCustomerId);
    return shopifyCustomerId;
  } catch (error) {
    console.error("❌ ERROR in getOrCreateShopifyCustomer:", error);
    if (error instanceof Error) {
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);
    }
    return null;
  }
}

// Додаткова функція для отримання замовлень
export async function getShopifyCustomerOrders(
  customerId: string
): Promise<ShopifyOrder[]> {
  try {
    const result = await shopifyAdminFetch<ShopifyOrdersResponse>(
      `customers/${customerId}/orders.json?status=any&limit=10`
    );
    return result.orders || [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}
