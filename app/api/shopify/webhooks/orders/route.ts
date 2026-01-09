// app/api/shopify/webhooks/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";

// Типы для Shopify webhook
interface ShopifyLineItem {
  title: string;
  quantity: number;
  price: string;
  product_id?: number;
  properties?: Array<{ name: string; value: string }>;
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email?: string;
  total_price: string;
  currency: string;
  created_at: string;
  financial_status: string;
  fulfillment_status: string | null;
  line_items: ShopifyLineItem[];
}

interface ClerkOrder {
  shopifyOrderId: number;
  orderNumber: number;
  totalPrice: string;
  currency: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
  items: Array<{
    title: string;
    quantity: number;
    price: string;
    productHandle: string | null;
    image: string | null;
  }>;
}

function verifyShopifyWebhook(body: string, hmac: string): boolean {
  const hash = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body, "utf8")
    .digest("base64");
  return hash === hmac;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const hmac = req.headers.get("x-shopify-hmac-sha256");

    if (!hmac || !verifyShopifyWebhook(body, hmac)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const order = JSON.parse(body) as ShopifyOrder;

    console.log("=== New Shopify Order ===");
    console.log("Order ID:", order.id);
    console.log("Order Number:", order.order_number);
    console.log("Customer email:", order.email);
    console.log("Total:", order.total_price, order.currency);

    if (!order.email) {
      console.log("No email in order, skipping sync");
      return NextResponse.json({ status: "no_email" });
    }

    // Найти пользователя Clerk по email
    const client = await clerkClient();
    const users = await client.users.getUserList({
      emailAddress: [order.email],
    });

    if (users.data.length === 0) {
      console.log("User not found in Clerk for email:", order.email);
      return NextResponse.json({ status: "user_not_found" });
    }

    const user = users.data[0];

    // Получить существующие заказы
    const existingOrders = (user.publicMetadata?.orders as ClerkOrder[]) || [];

    // Проверить, не добавлен ли уже этот заказ
    const orderExists = existingOrders.some(
      (o: ClerkOrder) => o.shopifyOrderId === order.id
    );

    if (orderExists) {
      console.log("Order already exists in Clerk, skipping");
      return NextResponse.json({ status: "already_exists" });
    }

    // Создать новый заказ
    const newOrder: ClerkOrder = {
      shopifyOrderId: order.id,
      orderNumber: order.order_number,
      totalPrice: order.total_price,
      currency: order.currency,
      createdAt: order.created_at,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      items: order.line_items.map((item: ShopifyLineItem) => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        productHandle: item.product_id ? `${item.product_id}` : null,
        image: item.properties?.find((p) => p.name === "_image")?.value || null,
      })),
    };

    // Сохранить в metadata
    await client.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        orders: [...existingOrders, newOrder],
      },
    });

    console.log("✅ Order saved to Clerk user:", user.id);
    console.log("Total orders now:", existingOrders.length + 1);
    console.log("=== Order Sync Complete ===");

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
