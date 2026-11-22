// app\api\shopify\checkout\route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { shopifyFetchWithLocale } from "@/app/lib/shopify/client";
import type { Locale } from "@/app/[lang]/messages";

export const runtime = "nodejs";

// -------------------------------------------
// TYPES
// -------------------------------------------

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutRequest = {
  items?: unknown;
  lang?: unknown;
  countryCode?: unknown;
};

type CartCreateResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
      buyerIdentity: {
        countryCode: string | null;
      };
      cost: {
        subtotalAmount: {
          amount: string;
          currencyCode: string;
        };
      };
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
};

type BuyerIdentity = {
  email: string;
  countryCode: "EE";
  phone?: string;
};

// -------------------------------------------
// SHOPIFY CART CREATE MUTATION
// -------------------------------------------

const CART_CREATE = `
  mutation CartCreate(
    $lines: [CartLineInput!]
    $language: LanguageCode
    $country: CountryCode
    $buyerIdentity: CartBuyerIdentityInput
  ) @inContext(
    language: $language,
    country: $country
  ) {
    cartCreate(
      input: {
        lines: $lines
        buyerIdentity: $buyerIdentity
      }
    ) {
      cart {
        id
        checkoutUrl

        buyerIdentity {
          countryCode
        }

        cost {
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }

      userErrors {
        field
        message
      }
    }
  }
`;

// -------------------------------------------
// VALIDATION HELPERS
// -------------------------------------------

const supportedLocales = ["en", "et", "fi", "ru", "uk"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    supportedLocales.some((locale) => locale === value)
  );
}

function parseItems(value: unknown): CheckoutItem[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  if (value.length === 0 || value.length > 40) {
    return null;
  }

  const quantities = new Map<string, number>();

  for (const rawItem of value) {
    if (!isRecord(rawItem)) {
      return null;
    }

    const id = rawItem.id;
    const quantity = rawItem.quantity;

    if (
      typeof id !== "string" ||
      !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(id) ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return null;
    }

    const totalQuantity = (quantities.get(id) ?? 0) + quantity;

    if (totalQuantity > 100) {
      return null;
    }

    quantities.set(id, totalQuantity);
  }

  return Array.from(quantities, ([id, quantity]) => ({
    id,
    quantity,
  }));
}

// -------------------------------------------
// CHECKOUT API
// -------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. CHECK CLERK AUTHENTICATION

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      );
    }

    // 2. READ REQUEST BODY

    let body: CheckoutRequest;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request JSON",
        },
        { status: 400 },
      );
    }

    // 3. VALIDATE LANGUAGE

    if (!isLocale(body?.lang)) {
      return NextResponse.json(
        {
          error: "Invalid language",
        },
        { status: 400 },
      );
    }

    const locale = body.lang;

    // 4. VALIDATE COUNTRY

    // Standard checkout is allowed only
    // for delivery within Estonia.

    if (body.countryCode !== "EE") {
      return NextResponse.json(
        {
          error: "Standard checkout is available only for Estonia",
          checkoutType: "draft_order",
          requiresShippingQuote: true,
        },
        { status: 409 },
      );
    }

    // 5. VALIDATE CART ITEMS

    const items = parseItems(body.items);

    if (!items) {
      return NextResponse.json(
        {
          error: "Invalid cart items",
        },
        { status: 400 },
      );
    }

    // 6. GET CLERK USER DATA

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    const userEmail =
      user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        {
          error: "User email not found",
        },
        { status: 400 },
      );
    }

    // 7. BUILD SHOPIFY CART LINES

    // Do not accept product prices from
    // the browser. Shopify calculates them.

    const lines = items.map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    // 8. BUILD BUYER IDENTITY

    // We no longer use the address stored
    // in Clerk publicMetadata.
    //
    // The buyer enters the full delivery
    // address in Shopify Checkout.

    const buyerIdentity: BuyerIdentity = {
      email: userEmail,
      countryCode: "EE",
    };

    const primaryPhone =
      user.phoneNumbers.find((phone) => phone.id === user.primaryPhoneNumberId)
        ?.phoneNumber ?? user.phoneNumbers[0]?.phoneNumber;

    if (primaryPhone) {
      buyerIdentity.phone = primaryPhone;
    }

    // 9. CREATE SHOPIFY CART

    const data = await shopifyFetchWithLocale<CartCreateResponse>(
      CART_CREATE,
      {
        lines,
        buyerIdentity,
      },
      locale,
      0,
    );

    const result = data.cartCreate;

    if (!result) {
      return NextResponse.json(
        {
          error: "Invalid Shopify response",
        },
        { status: 502 },
      );
    }

    const { cart, userErrors } = result;

    if (userErrors?.length) {
      console.error(
        "Shopify cartCreate errors:",
        userErrors.map((error) => error.message),
      );

      return NextResponse.json(
        {
          error: "Unable to create Shopify cart",
        },
        { status: 400 },
      );
    }

    if (!cart || !cart.checkoutUrl) {
      return NextResponse.json(
        {
          error: "Shopify checkout URL not found",
        },
        { status: 502 },
      );
    }

    // 10. VERIFY SHOPIFY COUNTRY

    if (cart.buyerIdentity?.countryCode !== "EE") {
      return NextResponse.json(
        {
          error: "Invalid Shopify cart country",
        },
        { status: 409 },
      );
    }

    // 11. VERIFY SHOPIFY SUBTOTAL

    // Use Shopify's real cart subtotal,
    // not totalPrice from the browser.
    //
    // Shipping and tax are not added to
    // the 50 EUR threshold.

    const subtotalAmount = cart.cost?.subtotalAmount;

    if (subtotalAmount?.currencyCode !== "EUR") {
      return NextResponse.json(
        {
          error: "Unsupported checkout currency",
        },
        { status: 409 },
      );
    }

    const amount = subtotalAmount.amount;

    // Accept decimal money values, e.g.
    // 24, 24.5 or 24.50.

    if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      return NextResponse.json(
        {
          error: "Invalid Shopify subtotal",
        },
        { status: 502 },
      );
    }

    const [euros, cents = ""] = amount.split(".");

    const subtotalCents = Number(euros) * 100 + Number(cents.padEnd(2, "0"));

    if (!Number.isSafeInteger(subtotalCents)) {
      return NextResponse.json(
        {
          error: "Invalid checkout amount",
        },
        { status: 502 },
      );
    }

    // ESTONIA OVER 50 EUR:
    // DO NOT RETURN CHECKOUT URL.
    // CUSTOMER MUST USE DRAFT ORDER FLOW.

    if (subtotalCents > 5000) {
      return NextResponse.json(
        {
          error: "Shipping quote is required",
          checkoutType: "draft_order",
          requiresShippingQuote: true,
        },
        { status: 409 },
      );
    }

    // 12. VERIFY CHECKOUT URL

    let checkoutUrl: URL;

    try {
      checkoutUrl = new URL(cart.checkoutUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid Shopify checkout URL",
        },
        { status: 502 },
      );
    }

    if (
      checkoutUrl.protocol !== "https:" ||
      (!checkoutUrl.hostname.endsWith(".myshopify.com") &&
        checkoutUrl.hostname !==
          new URL(`https://${process.env.SHOPIFY_DOMAIN ?? "invalid.example"}`)
            .hostname)
    ) {
      // Shopify can return a custom
      // storefront checkout domain.
      //
      // A different trusted checkout
      // hostname must be explicitly
      // configured if your shop uses one.
      return NextResponse.json(
        {
          error: "Unexpected checkout URL domain",
        },
        { status: 502 },
      );
    }

    // 13. SUCCESS

    // This endpoint only creates a Shopify
    // cart and returns a checkout URL.
    //
    // It does not collect payment.

    return NextResponse.json(
      {
        checkoutUrl: cart.checkoutUrl,
        checkoutType: "standard",
        countryCode: "EE",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Shopify Checkout API error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        error: "Failed to create checkout",
      },
      { status: 500 },
    );
  }
}
