// scripts\check-shopify-admin.mjs

import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const token = process.env.SHOPIFY_ADMIN_TOKEN;
const rawDomain = process.env.SHOPIFY_DOMAIN;

if (!token || !rawDomain) {
  console.error("❌ SHOPIFY_ADMIN_TOKEN або SHOPIFY_DOMAIN відсутній");
  process.exit(1);
}

const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

const query = `
  query CheckAdminAccess {
    shop {
      name
    }
    draftOrders(first: 1) {
      nodes {
        id
      }
    }
  }
`;

try {
  const response = await fetch(
    `https://${domain}/admin/api/2026-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query }),
    },
  );

  const result = await response.json();

  if (!response.ok || result.errors?.length) {
    console.error("❌ Shopify API error:", {
      status: response.status,
      errors: result.errors?.map((error) => error.message),
    });
    process.exitCode = 1;
  } else {
    console.log("✅ Shopify Admin API працює!");
    console.log("Магазин:", result.data.shop.name);
    console.log("✅ Доступ до Draft Orders підтверджено!");
  }
} catch (error) {
  console.error(
    "❌ Помилка підключення:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
}
