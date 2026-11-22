import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { shopifyAdminFetch } from "@/app/lib/shopify/admin";

export const runtime = "nodejs";

// ------------------------------------------
// TYPES
// ------------------------------------------

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

type ShopifyVariant = {
  id: string;
  price: string;
  inventoryQuantity: number | null;
  inventoryPolicy: string;

  inventoryItem: {
    tracked: boolean;
  } | null;

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

type ActiveDraftOrder = {
  id: string;
  name: string;
  status: string;
  note2: string | null;
};

type DraftOrdersResponse = {
  draftOrders: {
    nodes: ActiveDraftOrder[];

    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
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

        inventoryItem {
          tracked
        }

        product {
          status
        }
      }
    }
  }
`;

const GET_ACTIVE_DRAFT_ORDERS = `
  query GetActiveDraftOrders(
    $cursor: String
    $search: String!
  ) {
    draftOrders(
      first: 100
      after: $cursor
      query: $search
    ) {
      nodes {
        id
        name
        status
        note2
      }

      pageInfo {
        hasNextPage
        endCursor
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

// ------------------------------------------
// VALIDATE CART ITEMS
// ------------------------------------------

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

    const nextQuantity = (quantities.get(id) ?? 0) + quantity;

    if (nextQuantity > 100) {
      return null;
    }

    quantities.set(id, nextQuantity);
  }

  return Array.from(quantities, ([id, quantity]) => ({
    id,
    quantity,
  }));
}

// ------------------------------------------
// VALIDATE SHIPPING ADDRESS
// ------------------------------------------

function parseAddress(value: unknown): ShippingAddress | null {
  if (!isRecord(value)) {
    return null;
  }

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
// CHECK EXISTING ACTIVE DRAFT ORDER
// ------------------------------------------

async function findActiveDraftOrder(
  userId: string,
): Promise<ActiveDraftOrder | null> {
  let cursor: string | null = null;

  // Search Draft Orders created by our app.
  // Match the Clerk user ID stored in Notes.
  //
  // OPEN and INVOICE_SENT are considered
  // active. COMPLETED does not block.
  //
  // Scan up to 20 pages. If the search
  // exceeds this limit, fail safely.

  for (let page = 0; page < 20; page++) {
    const data: DraftOrdersResponse =
      await shopifyAdminFetch<DraftOrdersResponse>(GET_ACTIVE_DRAFT_ORDERS, {
        cursor,
        search: "tag:SHIPPING_QUOTE_REQUIRED",
      });

    const connection = data.draftOrders;

    for (const draft of connection.nodes) {
      const isActive =
        draft.status === "OPEN" || draft.status === "INVOICE_SENT";

      // Shopify uses "note2" when reading
      // Draft Order notes via GraphQL.

      const belongsToUser =
        draft.note2
          ?.split("\n")
          .some((line: string) => line.trim() === `Clerk user ID: ${userId}`) ??
        false;

      if (isActive && belongsToUser) {
        return draft;
      }
    }

    if (!connection.pageInfo.hasNextPage) {
      return null;
    }

    if (!connection.pageInfo.endCursor) {
      throw new Error("Draft Order pagination cursor is missing");
    }

    cursor = connection.pageInfo.endCursor;
  }

  throw new Error("Draft Order search limit exceeded");
}

// ------------------------------------------
// CREATE DRAFT ORDER
// ------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // --------------------------------------
    // 1. CLERK AUTHENTICATION
    // --------------------------------------

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 },
      );
    }

    // --------------------------------------
    // 2. VALIDATE REQUEST
    // --------------------------------------

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON",
        },
        { status: 400 },
      );
    }

    if (!isRecord(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const items = parseItems(body.items);

    const shippingAddress = parseAddress(body.shippingAddress);

    if (!items) {
      return NextResponse.json(
        {
          error: "Invalid cart items",
        },
        { status: 400 },
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          error: "Valid shipping address is required",
        },
        { status: 400 },
      );
    }

    // --------------------------------------
    // 3. BLOCK DUPLICATE DRAFT ORDERS
    // --------------------------------------

    const existingDraft = await findActiveDraftOrder(userId);

    if (existingDraft) {
      return NextResponse.json(
        {
          error: "ACTIVE_DRAFT_ORDER_EXISTS",
          message: "You already have an active order request.",
          draftOrderName: existingDraft.name,
          draftOrderStatus: existingDraft.status,
        },
        { status: 409 },
      );
    }

    // --------------------------------------
    // 4. GET CLERK USER
    // --------------------------------------

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    const email =
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          error: "User email not found",
        },
        { status: 400 },
      );
    }

    // --------------------------------------
    // 5. VERIFY PRODUCTS AND PRICES
    // --------------------------------------

    const ids = items.map((item) => item.id);

    const variantsData = await shopifyAdminFetch<VariantsResponse>(
      GET_VARIANTS,
      { ids },
    );

    if (variantsData.shop.currencyCode !== "EUR") {
      return NextResponse.json(
        {
          error: "Unsupported shop currency",
        },
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
          {
            error: "Product variant not found",
          },
          { status: 400 },
        );
      }

      if (variant.product.status !== "ACTIVE") {
        return NextResponse.json(
          {
            error: "Product is not active",
          },
          { status: 409 },
        );
      }

      const price = Number(variant.price);

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            error: "Invalid product price",
          },
          { status: 409 },
        );
      }

      // ----------------------------------
      // INVENTORY CHECK
      // ----------------------------------

      const inventoryIsTracked = variant.inventoryItem?.tracked === true;

      const oversellingIsForbidden = variant.inventoryPolicy === "DENY";

      const insufficientInventory =
        variant.inventoryQuantity !== null &&
        variant.inventoryQuantity < item.quantity;

      if (
        inventoryIsTracked &&
        oversellingIsForbidden &&
        insufficientInventory
      ) {
        return NextResponse.json(
          {
            error: "Insufficient product inventory",
          },
          { status: 409 },
        );
      }

      // Calculate subtotal in cents.

      const unitPriceCents = Math.round(price * 100);

      subtotalCents += unitPriceCents * item.quantity;
    }

    if (!Number.isSafeInteger(subtotalCents)) {
      return NextResponse.json(
        {
          error: "Invalid order amount",
        },
        { status: 400 },
      );
    }

    // --------------------------------------
    // 6. SHIPPING RULES
    // --------------------------------------

    const isEstonia = shippingAddress.countryCode === "EE";

    const requiresShippingQuote = !isEstonia || subtotalCents > 5000;

    // Estonia up to 50 EUR:
    // use standard Shopify Checkout.

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

    // --------------------------------------
    // 7. PREPARE DRAFT ORDER
    // --------------------------------------

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

        ...(shippingAddress.phone
          ? {
              phone: shippingAddress.phone,
            }
          : {}),
      },

      // Important:
      // Use "note" when CREATING a Draft Order.
      // Use "note2" when READING it.

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

    // --------------------------------------
    // 8. CREATE SHOPIFY DRAFT ORDER
    // --------------------------------------

    const data = await shopifyAdminFetch<DraftOrderCreateResponse>(
      CREATE_DRAFT_ORDER,
      {
        input: draftInput,
      },
    );

    const result = data.draftOrderCreate;

    if (result.userErrors.length > 0) {
      console.error(
        "Draft Order validation failed:",
        result.userErrors.map((error) => error.message),
      );

      return NextResponse.json(
        {
          error: "Draft order creation failed",
        },
        { status: 400 },
      );
    }

    if (!result.draftOrder) {
      return NextResponse.json(
        {
          error: "Draft order was not created",
        },
        { status: 500 },
      );
    }

    // --------------------------------------
    // 9. SUCCESS
    // --------------------------------------

    // No invoice is sent automatically.
    // No payment is collected.
    // Shipping must be confirmed manually.

    return NextResponse.json(
      {
        success: true,
        draftOrderId: result.draftOrder.id,
        orderNumber: result.draftOrder.name,
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
      {
        error: "Unable to create draft order",
      },
      { status: 500 },
    );
  }
}
