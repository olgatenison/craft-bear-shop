// app\[lang]\api\account\orders\route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { OrderForUi } from "@/app/components/ui/OrdersList";
import { fetchProductByShopifyNumericIdFlattened } from "@/app/data/repo";
import type { Locale } from "@/app/lib/locale";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lang = (req.nextUrl.searchParams.get("lang") || "en") as Locale;

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const ordersFromMeta = (user.publicMetadata?.orders as any[]) || [];

    const orders: OrderForUi[] = await Promise.all(
      ordersFromMeta.map(async (order) => {
        const products = await Promise.all(
          (order.items ?? []).map(async (item: any, index: number) => {
            let handle: string | null = null;

            if (item.shopifyProductId) {
              try {
                const product = await fetchProductByShopifyNumericIdFlattened(
                  item.shopifyProductId,
                  lang,
                );
                handle = product?.handle ?? null;
              } catch {
                handle = null;
              }
            }

            return {
              id: item.variantId || `${order.shopifyOrderId}-${index}`,
              name: item.title,
              handle,
              href: handle ? `/${lang}/product/${handle}` : null,
              price: `${item.price} ${order.currency}`,
              status: order.fulfillmentStatus || "pending",
              quantity: item.quantity,
            };
          }),
        );

        return {
          shopifyOrderId: order.shopifyOrderId,
          number: order.name || `#${order.orderNumber}`,
          date: new Date(order.createdAt).toLocaleDateString(lang, {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          datetime: order.createdAt,
          total: `${order.totalPrice} ${order.currency}`,
          financialStatus: (order.financialStatus || "").toLowerCase(),
          fulfillmentStatus: (
            order.fulfillmentStatus ?? "unfulfilled"
          ).toLowerCase(),
          shippingAddress: order.shippingAddress,
          tracking: order.tracking,
          products,
        };
      }),
    );

    orders.sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime(),
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Orders API error:", error);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 },
    );
  }
}
