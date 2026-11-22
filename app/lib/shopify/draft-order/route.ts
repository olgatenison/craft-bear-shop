import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { shopifyAdminFetch } from "@/app/lib/shopify/admin";

export const runtime = "nodejs";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type ShippingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
  countryCode: string;
  provinceCode?: string;
  phone?: string;
};

type DraftOrderRequest = {
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
};

type ShopifyVariant = {
  id: string;
  price: string;
  inventoryQuantity: number | null;
  inventoryPolicy: string;
  product: {
    status: string;
  };
};

type VariantsResponse = {
  shop: {
    currencyCode: string;
  };
  nodes: Array<ShopifyVariant | null>;
};

type DraftOrderCreateResponse = {
  draftOrderCreate: {
    draftOrder: {
      id: string;
      name: string;
      status: string;
    } | null;
    userErrors: Array<{
      field: string[] | null;
      message: string;
    }>;
  };
};

// ------------------------------------------
// SHOPIFY QUERIES
// ------------------------------------------

const GET_VARIANTS = `
  query GetDraftOrderVariants($ids: [ID!]!) {
    shop {
      currencyCode
    }

    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        price
        inventoryQuantity
        inventoryPolicy

        product {
          status
        }
      }
    }
  }
`;

const CREATE_DRAFT_ORDER = `
  mutation CreateDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        status
      }

      userErrors {
        field
        message
      }
    }
  }
`;

// ------------------------------------------
// HELPERS
// ------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength = 150): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseItems(value: unknown): CheckoutItem[] | null {
  if (!Array.isArray(value)) return null;

  if (value.length === 0 || value.length > 40) {
    return null;
  }

  const quantities = new Map<string, number>();

  for (const rawItem of value) {
    if (!isRecord(rawItem)) return null;

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

    const nextQuantity = (quantities.get(id) ?? 0) + quantity;

    if (nextQuantity > 100) return null;

    quantities.set(id, nextQuantity);
  }

  return Array.from(quantities, ([id, quantity]) => ({
    id,
    quantity,
  }));
}

function parseAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) return null;

  const address: ShippingAddress = {
    firstName: cleanText(value.firstName),
    lastName: cleanText(value.lastName),
    address1: cleanText(value.address1, 250),
    address2: cleanText(value.address2, 250),
    city: cleanText(value.city),
    zip: cleanText(value.zip, 30),
    countryCode: cleanText(value.countryCode).toUpperCase(),
    provinceCode: cleanText(value.provinceCode),
    phone: cleanText(value.phone, 30),
  };

  if (
    !address.firstName ||
    !address.lastName ||
    !address.address1 ||
    !address.city ||
    !address.zip ||
    !/^[A-Z]{2}$/.test(address.countryCode)
  ) {
    return null;
  }

  return address;
}

// ------------------------------------------
// CREATE DRAFT ORDER
// ------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. AUTHENTICATION

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // 2. REQUEST VALIDATION

    let body: DraftOrderRequest;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const items = parseItems(body?.items);
    const shippingAddress = parseAddress(body?.shippingAddress);

    if (!items) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 },
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Valid shipping address is required" },
        { status: 400 },
      );
    }

    // 3. GET CLERK USER

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const email =
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    // 4. VERIFY PRODUCTS AND PRICES

    const ids = items.map((item) => item.id);

    const variantsData = await shopifyAdminFetch<VariantsResponse>(
      GET_VARIANTS,
      { ids },
    );

    if (variantsData.shop.currencyCode !== "EUR") {
      return NextResponse.json(
        { error: "Unsupported shop currency" },
        { status: 409 },
      );
    }

    const variantsMap = new Map(
      variantsData.nodes
        .filter(
          (variant): variant is ShopifyVariant =>
            variant !== null && typeof variant.id === "string",
        )
        .map((variant) => [variant.id, variant]),
    );

    let subtotalCents = 0;

    for (const item of items) {
      const variant = variantsMap.get(item.id);

      if (!variant) {
        return NextResponse.json(
          { error: "Product variant not found" },
          { status: 400 },
        );
      }

      if (variant.product.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Product is not active" },
          { status: 409 },
        );
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: "Invalid product price" },
          { status: 409 },
        );
      }

      // Basic inventory check.
      if (
        variant.inventoryPolicy === "DENY" &&
        variant.inventoryQuantity !== null &&
        variant.inventoryQuantity < item.quantity
      ) {
        return NextResponse.json(
          { error: "Insufficient product inventory" },
          { status: 409 },
        );
      }

      const unitPriceCents = Math.round(price * 100);

      subtotalCents += unitPriceCents * item.quantity;
    }

    if (!Number.isSafeInteger(subtotalCents)) {
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 },
      );
    }

    // 5. SHIPPING RULES

    const isEstonia = shippingAddress.countryCode === "EE";

    const requiresShippingQuote = !isEstonia || subtotalCents > 5000;

    // Standard orders go through Shopify Checkout.
    if (!requiresShippingQuote) {
      return NextResponse.json(
        {
          error: "Use standard checkout",
          checkoutType: "standard",
        },
        { status: 409 },
      );
    }

    const shippingReason = !isEstonia
      ? "INTERNATIONAL_DELIVERY"
      : "ORDER_OVER_50_EUR";

    // 6. PREPARE DRAFT ORDER

    const draftInput = {
      email,

      lineItems: items.map((item) => ({
        variantId: item.id,
        quantity: item.quantity,
      })),

      shippingAddress: {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        zip: shippingAddress.zip,
        countryCode: shippingAddress.countryCode,
        ...(shippingAddress.provinceCode
          ? {
              provinceCode: shippingAddress.provinceCode,
            }
          : {}),
        ...(shippingAddress.phone ? { phone: shippingAddress.phone } : {}),
      },

      note: [
        "Craft Bear Store",
        "Shipping quote required",
        `Reason: ${shippingReason}`,
        `Country: ${shippingAddress.countryCode}`,
        `Verified cart subtotal: ${(subtotalCents / 100).toFixed(2)} EUR`,
        `Clerk user ID: ${userId}`,
        "Do not request payment before shipping is agreed.",
      ].join("\n"),

      tags: [
        "CRAFT_BEAR",
        "SHIPPING_QUOTE_REQUIRED",
        "AWAITING_SHIPPING_CONFIRMATION",
        shippingReason,
      ],

      customAttributes: [
        {
          key: "shipping_status",
          value: "pending_quote",
        },
        {
          key: "shipping_country",
          value: shippingAddress.countryCode,
        },
        {
          key: "shipping_reason",
          value: shippingReason,
        },
      ],
    };

    // 7. CREATE SHOPIFY DRAFT ORDER

    const data = await shopifyAdminFetch<DraftOrderCreateResponse>(
      CREATE_DRAFT_ORDER,
      { input: draftInput },
    );

    const { draftOrder, userErrors } = data.draftOrderCreate;

    if (userErrors.length > 0) {
      console.error(
        "Draft Order validation failed:",
        userErrors.map((error) => error.message),
      );

      return NextResponse.json(
        {
          error: "Draft order creation failed",
        },
        { status: 400 },
      );
    }

    if (!draftOrder) {
      return NextResponse.json(
        { error: "Draft order was not created" },
        { status: 500 },
      );
    }

    // 8. SUCCESS

    // No invoice is sent.
    // No payment is collected.
    // Shipping must be confirmed manually.

    return NextResponse.json(
      {
        success: true,
        draftOrderId: draftOrder.id,
        orderNumber: draftOrder.name,
        shippingStatus: "pending_quote",
        paymentRequiredNow: false,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Draft Order API error:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: "Unable to create draft order" },
      { status: 500 },
    );
  }
}
