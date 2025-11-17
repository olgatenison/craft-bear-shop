// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ← Додайте

const COOKIE_NAME = "customerAccessToken";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;
const SHOPIFY_API_VERSION = "2024-10";

const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      acceptsMarketing
    }
  }
`;

export async function GET() {
  // Спробуйте обидва способи
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  console.log(
    "[/api/auth/me] Token from cookies():",
    token ? "EXISTS" : "MISSING"
  );
  console.log(
    "[/api/auth/me] All cookies:",
    cookieStore.getAll().map((c) => c.name)
  );

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: CUSTOMER_QUERY,
        variables: { customerAccessToken: token },
      }),
    });

    const json = await resp.json();

    if (!resp.ok || json.errors) {
      console.log("[/api/auth/me] Shopify error:", json.errors);
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const customer = json.data.customer;

    if (!customer) {
      console.log("[/api/auth/me] Invalid token, clearing cookie");
      cookieStore.delete(COOKIE_NAME);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    console.log("[/api/auth/me] Customer found:", customer.email);

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
