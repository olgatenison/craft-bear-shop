// app/api/account/orders/route.ts

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

const RAW_SHOPIFY_DOMAIN =
  process.env.SHOPIFY_DOMAIN ??
  process.env.SHOPIFY_STORE_DOMAIN ?? // на всякий случай, если где-то так назвала
  process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN;

const RAW_SHOPIFY_ADMIN_TOKEN =
  process.env.SHOPIFY_ADMIN_TOKEN ?? process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// --- Типы под ответ Shopify, чтобы не ловить any ---

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type ShopifyLineItemNode = {
  id: string;
  name: string;
  quantity: number;
  originalTotalSet?: {
    shopMoney: ShopifyMoney;
  } | null;
  variant?: {
    image?: ShopifyImage | null;
  } | null;
  product?: {
    handle: string;
    title: string;
    featuredImage?: ShopifyImage | null;
  } | null;
};

type ShopifyOrderNode = {
  id: string;
  name: string;
  createdAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPriceSet: {
    shopMoney: ShopifyMoney;
  };
  lineItems: {
    edges: { node: ShopifyLineItemNode }[];
  };
};

type ShopifyOrdersResponse = {
  data?: {
    orders?: {
      edges: { node: ShopifyOrderNode }[];
    };
  };
};

// --- Сам GraphQL-запрос ---

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
            shopMoney {
              amount
              currencyCode
            }
          }
          lineItems(first: 20) {
            edges {
              node {
                id
                name
                quantity
                originalTotalSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                variant {
                  image {
                    url
                    altText
                  }
                }
                product {
                  handle
                  title
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// --- Handler GET /api/account/orders ---

export async function GET() {
  // 1) Проверяем env, но аккуратно — без крэша всего dev-сервера
  if (!RAW_SHOPIFY_DOMAIN) {
    console.error("SHOPIFY_DOMAIN (или SHOPIFY_STORE_DOMAIN) is not set");
    return NextResponse.json(
      { error: "Shopify domain is not configured" },
      { status: 500 }
    );
  }

  if (!RAW_SHOPIFY_ADMIN_TOKEN) {
    console.error(
      "SHOPIFY_ADMIN_TOKEN (или SHOPIFY_ADMIN_ACCESS_TOKEN) is not set"
    );
    return NextResponse.json(
      { error: "Shopify admin token is not configured" },
      { status: 500 }
    );
  }

  const SHOPIFY_DOMAIN = RAW_SHOPIFY_DOMAIN;
  const SHOPIFY_ADMIN_TOKEN = RAW_SHOPIFY_ADMIN_TOKEN;

  // 2) Берём юзера из Clerk
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0];

  const email = primaryEmail?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "User has no email" }, { status: 400 });
  }

  // 3) Делаем запрос в Shopify Admin API
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

  const json = (await res.json()) as ShopifyOrdersResponse;
  const edges = json.data?.orders?.edges ?? [];

  // 4) Мапим сразу в формат, который ест твой OrdersList

  const orders = edges.map(({ node }) => {
    const totalMoney = node.totalPriceSet.shopMoney;

    const createdAt = node.createdAt;
    const createdDate = new Date(createdAt);
    const dateLabel = createdDate.toLocaleDateString("en-EE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const products = node.lineItems.edges.map(({ node: li }) => {
      const priceMoney = li.originalTotalSet?.shopMoney ?? null;
      const img = li.variant?.image ?? li.product?.featuredImage ?? null;

      return {
        id: li.id,
        name: li.name,
        // TODO: когда будут product pages → сюда `/[lang]/product/${li.product?.handle}`
        href: "#",
        price: priceMoney
          ? `${priceMoney.amount} ${priceMoney.currencyCode}`
          : "",
        status: node.fulfillmentStatus ?? "",
        imageSrc: img?.url ?? "/category/Steam_Beer_700x700px.webp",
        imageAlt: img?.altText ?? li.name,
      };
    });

    return {
      number: node.name,
      date: dateLabel,
      datetime: createdAt,
      total: `${totalMoney.amount} ${totalMoney.currencyCode}`,
      products,
    };
  });

  return NextResponse.json({ orders });
}

// Дальше можно уже заниматься красотой и удобством:
// Локализация дат
// Сейчас я тебе ставил toLocaleDateString("en-EE", ...). Можно потом:
// либо на фронте форматить по lang,
// либо в API прокидывать lang и форматить там.
// Ссылки на продукты
// Сейчас в товарах href: "#". Когда будут страницы продукта — подставим что-то вроде:
// href: `/${lang}/product/${li.product?.handle}`
// (нужен будет lang или хотя бы дефолтный /en/...).
// Тексты статуса
// Shopify даёт fulfillmentStatus типа FULFILLED, PARTIALLY_FULFILLED и т.п.
// Можем потом сделать маппер → нормальные фразы на каждом языке.

// И пагинация?
