// app/api/account/orders/route.ts
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!;

const ORDERS_BY_EMAIL = `
  query OrdersByEmail($query: String!) {
    orders(first: 20, query: $query, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          name
          createdAt
          financialStatus
          fulfillmentStatus
          totalPriceSet {
            shopMoney { amount currencyCode }
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                name
                quantity
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];

  const email = primaryEmail?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "User has no email" }, { status: 400 });
  }

  const res = await fetch(
    `https://${SHOPIFY_DOMAIN}/admin/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify({
        query: ORDERS_BY_EMAIL,
        variables: { query: `email:${email}` },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Shopify orders error:", text);
    return NextResponse.json(
      { error: "Failed to load orders" },
      { status: 500 }
    );
  }

  const json = await res.json();
  const edges = json.data?.orders?.edges ?? [];

  const orders = edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      name: node.name,
      createdAt: node.createdAt,
      financialStatus: node.financialStatus,
      fulfillmentStatus: node.fulfillmentStatus,
      total: node.totalPriceSet.shopMoney,
      items: node.lineItems.edges.map((li: any) => ({
        id: li.node.id,
        name: li.node.name,
        quantity: li.node.quantity,
      })),
    };
  });

  return NextResponse.json({ orders });
}
