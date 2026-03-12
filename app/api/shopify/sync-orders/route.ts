// app/api/shopify/sync-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

interface ShopifyFulfillment {
  tracking_number?: string | null;
  tracking_numbers?: string[];
  tracking_url?: string | null;
  tracking_urls?: string[];
}

interface ShopifyOrder {
  id: number;
  name?: string;
  order_number: number;
  email?: string;
  total_price: string;
  currency: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  fulfillments?: ShopifyFulfillment[];
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address1?: string;
    city?: string;
    country?: string;
    zip?: string;
  };
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
    product_id?: number;
    variant_id?: number;
  }>;
}

interface ClerkOrderItem {
  title: string;
  quantity: number;
  price: string;
  variantId: string | null;
}

interface ClerkOrder {
  shopifyOrderId: number;
  orderNumber: number;
  name?: string;
  totalPrice: string;
  currency: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  tracking?: {
    number: string;
    url: string;
  };
  shippingAddress?: {
    name: string;
    address1: string;
    city: string;
    country: string;
    zip: string;
  };
  items: ClerkOrderItem[];
}

// Получаем ПОЛНЫЕ детали одного заказа (без fields — чтобы точно получить fulfillments)
// async function fetchFullOrderDetails(
//   orderId: number,
//   accessToken: string,
//   domain: string,
// ): Promise<ShopifyOrder | null> {
//   try {
//     const url = `https://${domain}/admin/api/2024-10/orders/${orderId}.json`;
//     const res = await fetch(url, {
//       headers: { "X-Shopify-Access-Token": accessToken },
//     });
//     if (!res.ok) {
//       console.warn(`⚠️ Failed to fetch order ${orderId}:`, res.status);
//       return null;
//     }
//     const data = await res.json();
//     return data.order ?? null;
//   } catch (e) {
//     console.warn(`⚠️ Error fetching order ${orderId}:`, e);
//     return null;
//   }
// }
// Замени функцию fetchFullOrderDetails на эту версию
async function fetchFullOrderDetails(
  orderId: number,
  accessToken: string,
  domain: string,
): Promise<ShopifyOrder | null> {
  try {
    // Запрашиваем явно все нужные поля включая shipping_address
    const url = `https://${domain}/admin/api/2024-10/orders/${orderId}.json?fields=id,name,order_number,email,total_price,currency,created_at,financial_status,fulfillment_status,fulfillments,shipping_address,line_items`;

    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (!res.ok) {
      console.warn(`⚠️ Failed to fetch order ${orderId}:`, res.status);
      return null;
    }
    const data = await res.json();
    console.log(
      `🏠 shipping_address for ${orderId}:`,
      JSON.stringify(data.order?.shipping_address),
    );
    return data.order ?? null;
  } catch (e) {
    console.warn(`⚠️ Error fetching order ${orderId}:`, e);
    return null;
  }
}
function extractTracking(fulfillments: ShopifyFulfillment[] | undefined):
  | {
      number: string;
      url: string;
    }
  | undefined {
  if (!fulfillments || fulfillments.length === 0) return undefined;

  // Ищем fulfillment с трекингом
  const withTracking = fulfillments.find(
    (f) =>
      f?.tracking_number ||
      (f?.tracking_numbers && f.tracking_numbers.length > 0),
  );

  if (!withTracking) return undefined;

  const number =
    withTracking.tracking_number || withTracking.tracking_numbers?.[0];
  const url =
    withTracking.tracking_url || withTracking.tracking_urls?.[0] || "";

  if (!number) return undefined;

  return { number: String(number), url: String(url) };
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Starting order sync for user:", userId);

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    const shopifyDomain = process.env.SHOPIFY_DOMAIN;
    const accessToken =
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

    if (!shopifyDomain || !accessToken) {
      throw new Error("Shopify credentials not configured");
    }

    // Шаг 1: получаем список заказов по email (только базовые поля — без fulfillments)
    const listUrl = `https://${shopifyDomain}/admin/api/2024-10/orders.json?email=${encodeURIComponent(
      userEmail,
    )}&status=any&limit=250&fields=id,name,order_number`;

    console.log("🔵 Fetching order list from Shopify...");

    const listResponse = await fetch(listUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error("❌ Shopify API error:", errorText);
      throw new Error(`Shopify API error: ${listResponse.statusText}`);
    }

    const { orders: orderList } = (await listResponse.json()) as {
      orders: Array<{ id: number; name: string; order_number: number }>;
    };

    console.log(`📦 Found ${orderList?.length || 0} orders in Shopify`);

    if (!orderList || orderList.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders found in Shopify",
        synced: 0,
        updated: 0,
        totalOrders: 0,
      });
    }

    // Шаг 2: для каждого заказа получаем ПОЛНЫЕ данные (включая fulfillments)
    console.log("🔵 Fetching full details for each order...");
    const fullOrders: ShopifyOrder[] = [];

    for (const { id } of orderList) {
      const full = await fetchFullOrderDetails(id, accessToken, shopifyDomain);
      if (full) {
        console.log(
          `Order ${full.name} FULL shipping_address:`,
          JSON.stringify(full.shipping_address),
        );
        console.log(`Order ${full.name} keys:`, Object.keys(full));
        console.log(
          `  ✅ Order ${full.name}: fulfillments=${full.fulfillments?.length ?? 0}, tracking=${extractTracking(full.fulfillments)?.number ?? "none"}`,
        );
        fullOrders.push(full);
      }
    }

    // Шаг 3: мержим с существующими данными в Clerk
    const existingOrders = (user.publicMetadata?.orders as ClerkOrder[]) || [];
    const existingMap = new Map<number, ClerkOrder>();
    for (const o of existingOrders) existingMap.set(o.shopifyOrderId, o);

    let updatedCount = 0;
    let createdCount = 0;

    for (const order of fullOrders) {
      const tracking = extractTracking(order.fulfillments);
      const fulfillmentStatus = (
        order.fulfillment_status ??
        ((order.fulfillments?.length ?? 0) > 0 ? "fulfilled" : "unfulfilled")
      ).toLowerCase();

      console.log(
        "🏠 Shipping address raw:",
        JSON.stringify(order.shipping_address, null, 2),
      );

      const mapped: ClerkOrder = {
        shopifyOrderId: order.id,
        orderNumber: order.order_number,
        name: order.name || `#${order.order_number}`,
        totalPrice: order.total_price,
        currency: order.currency,
        createdAt: order.created_at,
        financialStatus: String(order.financial_status || "").toLowerCase(),
        fulfillmentStatus,
        tracking,
        shippingAddress: order.shipping_address
          ? {
              name: `${order.shipping_address.first_name || ""} ${
                order.shipping_address.last_name || ""
              }`.trim(),
              address1: order.shipping_address.address1 || "",
              city: order.shipping_address.city || "",
              country: order.shipping_address.country || "",
              zip: order.shipping_address.zip || "",
            }
          : undefined,
        items: order.line_items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variant_id ? `${item.variant_id}` : null,
        })),
      };

      const prev = existingMap.get(order.id);
      if (prev) {
        existingMap.set(order.id, { ...prev, ...mapped });
        updatedCount += 1;
      } else {
        existingMap.set(order.id, mapped);
        createdCount += 1;
      }
    }

    const mergedOrders = Array.from(existingMap.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        orders: mergedOrders,
      },
    });

    console.log("✅ Orders synced successfully!");

    const sample = mergedOrders.slice(0, 5).map((o) => ({
      number: o.name || `#${o.orderNumber}`,
      payment: o.financialStatus,
      fulfillment: o.fulfillmentStatus,
      tracking: o.tracking?.number || null,
      hasShipping: Boolean(o.shippingAddress),
    }));

    console.log("📊 Sample:", JSON.stringify(sample, null, 2));

    return NextResponse.json({
      success: true,
      message: `Synced orders. Created: ${createdCount}, Updated: ${updatedCount}`,
      synced: createdCount,
      updated: updatedCount,
      totalOrders: mergedOrders.length,
      sample,
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
