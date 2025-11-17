import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers"; // ← Додайте цей імпорт

const COOKIE_NAME = "customerAccessToken";

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN!;
const SHOPIFY_API_VERSION = "2024-10";

const ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

const MUTATION = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        field
        message
        code
      }
    }
  }
`;

type ShopifyUserError = {
  field?: string[] | null;
  message: string;
  code?: string | null;
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const resp = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: MUTATION,
        variables: { input: { email, password } },
      }),
    });

    const json = await resp.json();

    console.log("[Shopify login response]", JSON.stringify(json, null, 2));

    if (!resp.ok || json.errors) {
      const msg =
        json.errors?.[0]?.message || resp.statusText || "Shopify GraphQL error";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    const data = json.data.customerAccessTokenCreate as {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: ShopifyUserError[];
    };

    if (data.customerUserErrors?.length || !data.customerAccessToken) {
      return NextResponse.json(
        { errors: data.customerUserErrors },
        { status: 400 }
      );
    }

    const { accessToken, expiresAt } = data.customerAccessToken;

    // Спробуйте через cookies() замість response.cookies
    const cookieStore = await cookies();
    cookieStore.set({
      name: COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(expiresAt),
    });

    console.log("[Cookie set via cookies()]", COOKIE_NAME, accessToken);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Login route error:", err);

    let message = "Something went wrong";

    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
