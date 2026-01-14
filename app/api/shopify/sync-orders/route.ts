// app/api/shopify/sync-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

interface ShopifyOrder {
  id: number;
  order_number: number;
  email?: string;
  total_price: string;
  currency: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
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

interface ClerkOrder {
  shopifyOrderId: number;
  orderNumber: number;
  totalPrice: string;
  currency: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  shippingAddress?: {
    name: string;
    address1: string;
    city: string;
    country: string;
    zip: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    variantId: string | null;
    image: string | null;
  }>;
}

// Получить картинки товаров
async function getProductImages(
  productIds: number[],
  accessToken: string,
  domain: string
): Promise<Map<number, string>> {
  const imageMap = new Map<number, string>();

  if (productIds.length === 0) return imageMap;

  try {
    const idsQuery = productIds.join(",");
    const response = await fetch(
      `https://${domain}/admin/api/2024-10/products.json?ids=${idsQuery}`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      for (const product of data.products || []) {
        if (product.image?.src) {
          imageMap.set(product.id, product.image.src);
        }
      }
    }
  } catch (error) {
    console.warn("Failed to fetch product images:", error);
  }

  return imageMap;
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
        { status: 400 }
      );
    }

    console.log("📧 User email:", userEmail);

    const shopifyDomain = process.env.SHOPIFY_DOMAIN;
    const accessToken =
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

    if (!shopifyDomain || !accessToken) {
      throw new Error("Shopify credentials not configured");
    }

    const shopifyUrl = `https://${shopifyDomain}/admin/api/2024-10/orders.json?email=${encodeURIComponent(
      userEmail
    )}&status=any&limit=250`;

    console.log("🔵 Fetching orders from Shopify...");

    const shopifyResponse = await fetch(shopifyUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error("❌ Shopify API error:", errorText);
      throw new Error(`Shopify API error: ${shopifyResponse.statusText}`);
    }

    const { orders } = await shopifyResponse.json();
    console.log(`📦 Found ${orders?.length || 0} orders in Shopify`);

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders found in Shopify",
        synced: 0,
        totalOrders: 0,
      });
    }

    const existingOrders = (user.publicMetadata?.orders as ClerkOrder[]) || [];
    console.log(`📋 Existing orders in Clerk: ${existingOrders.length}`);

    // Собираем все product_id для получения картинок
    const allProductIds = new Set<number>();
    orders.forEach((order: ShopifyOrder) => {
      order.line_items.forEach((item) => {
        if (item.product_id) allProductIds.add(item.product_id);
      });
    });

    console.log("📸 Fetching product images...");
    const imageMap = await getProductImages(
      Array.from(allProductIds),
      accessToken,
      shopifyDomain
    );
    console.log(`✅ Got images for ${imageMap.size} products`);

    const newOrders: ClerkOrder[] = orders
      .filter(
        (order: ShopifyOrder) =>
          !existingOrders.some((o: ClerkOrder) => o.shopifyOrderId === order.id)
      )
      .map((order: ShopifyOrder) => ({
        shopifyOrderId: order.id,
        orderNumber: order.order_number,
        totalPrice: order.total_price,
        currency: order.currency,
        createdAt: order.created_at,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
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
          image: item.product_id ? imageMap.get(item.product_id) || null : null,
        })),
      }));

    console.log(`✨ New orders to sync: ${newOrders.length}`);

    if (newOrders.length > 0) {
      await client.users.updateUser(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          orders: [...existingOrders, ...newOrders],
        },
      });

      console.log("✅ Orders synced successfully!");
      console.log(
        "Order numbers:",
        newOrders.map((o) => `#${o.orderNumber}`).join(", ")
      );
    } else {
      console.log("ℹ️ All orders already synced");
    }

    return NextResponse.json({
      success: true,
      message:
        newOrders.length > 0
          ? `Synced ${newOrders.length} new order${
              newOrders.length > 1 ? "s" : ""
            }`
          : "All orders already synced",
      synced: newOrders.length,
      totalOrders: existingOrders.length + newOrders.length,
      newOrders: newOrders.map((o) => ({
        orderNumber: o.orderNumber,
        total: `${o.totalPrice} ${o.currency}`,
        date: new Date(o.createdAt).toLocaleDateString(),
      })),
    });
  } catch (error) {
    console.error("❌ Sync error:", error);
    return NextResponse.json(
      {
        error: "Sync failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// // app/api/shopify/sync-orders/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { clerkClient } from "@clerk/nextjs/server";
// import { auth } from "@clerk/nextjs/server";

// interface ShopifyOrder {
//   id: number;
//   order_number: number;
//   email?: string;
//   total_price: string;
//   currency: string;
//   created_at: string;
//   financial_status: string;
//   fulfillment_status: string | null;
//   line_items: Array<{
//     title: string;
//     quantity: number;
//     price: string;
//     product_id?: number;
//     variant_id?: number;
//   }>;
// }

// interface ClerkOrder {
//   shopifyOrderId: number;
//   orderNumber: number;
//   totalPrice: string;
//   currency: string;
//   createdAt: string;
//   financialStatus: string;
//   fulfillmentStatus: string | null;
//   items: Array<{
//     title: string;
//     quantity: number;
//     price: string;
//     productHandle: string | null;
//     image: string | null;
//   }>;
// }

// export async function POST(req: NextRequest) {
//   try {
//     // Проверка авторизации
//     const { userId } = await auth();

//     if (!userId) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     console.log("🔄 Starting order sync for user:", userId);

//     // Получить данные пользователя
//     const client = await clerkClient();
//     const user = await client.users.getUser(userId);

//     const userEmail = user.emailAddresses[0]?.emailAddress;

//     if (!userEmail) {
//       return NextResponse.json(
//         { error: "User email not found" },
//         { status: 400 }
//       );
//     }

//     console.log("📧 User email:", userEmail);

//     // 1. Получить все заказы из Shopify для этого email
//     const shopifyDomain = process.env.SHOPIFY_DOMAIN;
//     const accessToken =
//       process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;

//     if (!shopifyDomain || !accessToken) {
//       throw new Error("Shopify credentials not configured");
//     }

//     const shopifyUrl = `https://${shopifyDomain}/admin/api/2024-10/orders.json?email=${encodeURIComponent(
//       userEmail
//     )}&status=any&limit=250`;

//     console.log("🔵 Fetching orders from Shopify...");

//     const shopifyResponse = await fetch(shopifyUrl, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!shopifyResponse.ok) {
//       const errorText = await shopifyResponse.text();
//       console.error("❌ Shopify API error:", errorText);
//       throw new Error(`Shopify API error: ${shopifyResponse.statusText}`);
//     }

//     const { orders } = await shopifyResponse.json();
//     console.log(`📦 Found ${orders?.length || 0} orders in Shopify`);

//     if (!orders || orders.length === 0) {
//       return NextResponse.json({
//         success: true,
//         message: "No orders found in Shopify",
//         synced: 0,
//         totalOrders: 0,
//       });
//     }

//     // 2. Получить существующие заказы из Clerk metadata
//     const existingOrders = (user.publicMetadata?.orders as ClerkOrder[]) || [];
//     console.log(`📋 Existing orders in Clerk: ${existingOrders.length}`);

//     // 3. Найти новые заказы (которых нет в Clerk)
//     const newOrders: ClerkOrder[] = orders
//       .filter(
//         (order: ShopifyOrder) =>
//           !existingOrders.some((o: ClerkOrder) => o.shopifyOrderId === order.id)
//       )
//       .map((order: ShopifyOrder) => ({
//         shopifyOrderId: order.id,
//         orderNumber: order.order_number,
//         totalPrice: order.total_price,
//         currency: order.currency,
//         createdAt: order.created_at,
//         financialStatus: order.financial_status,
//         fulfillmentStatus: order.fulfillment_status,
//         items: order.line_items.map((item) => ({
//           title: item.title,
//           quantity: item.quantity,
//           price: item.price,
//           productHandle: item.variant_id
//             ? `gid://shopify/ProductVariant/${item.variant_id}`
//             : null,
//           image: null,
//         })),
//       }));

//     console.log(`✨ New orders to sync: ${newOrders.length}`);

//     // 4. Сохранить новые заказы в Clerk
//     if (newOrders.length > 0) {
//       await client.users.updateUser(userId, {
//         publicMetadata: {
//           ...user.publicMetadata,
//           orders: [...existingOrders, ...newOrders],
//         },
//       });

//       console.log("✅ Orders synced successfully!");
//       console.log(
//         "Order numbers:",
//         newOrders.map((o) => `#${o.orderNumber}`).join(", ")
//       );
//     } else {
//       console.log("ℹ️ All orders already synced");
//     }

//     return NextResponse.json({
//       success: true,
//       message:
//         newOrders.length > 0
//           ? `Synced ${newOrders.length} new order${
//               newOrders.length > 1 ? "s" : ""
//             }`
//           : "All orders already synced",
//       synced: newOrders.length,
//       totalOrders: existingOrders.length + newOrders.length,
//       newOrders: newOrders.map((o) => ({
//         orderNumber: o.orderNumber,
//         total: `${o.totalPrice} ${o.currency}`,
//         date: new Date(o.createdAt).toLocaleDateString(),
//       })),
//     });
//   } catch (error) {
//     console.error("❌ Sync error:", error);
//     return NextResponse.json(
//       {
//         error: "Sync failed",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }
