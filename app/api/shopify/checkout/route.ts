// app/api/shopify/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { shopifyFetchWithLocale } from "@/app/lib/shopify/client";
import type { Locale } from "@/app/[lang]/messages";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CartCreateResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
};

type AddressMetadata = {
  address1?: string;
  address2?: string;
  city?: string;
  provinceCode?: string;
  countryCode?: string;
  zip?: string;
};

type BuyerIdentity = {
  email: string;
  phone?: string;
  deliveryAddressPreferences?: Array<{
    deliveryAddress: {
      address1: string;
      address2: string;
      city: string;
      provinceCode: string;
      countryCode: string;
      zip: string;
      firstName: string;
      lastName: string;
      phone: string;
    };
  }>;
};

const CART_CREATE = `
  mutation CartCreate(
    $lines: [CartLineInput!]
    $language: LanguageCode
    $country: CountryCode
    $buyerIdentity: CartBuyerIdentityInput
  ) @inContext(language: $language, country: $country) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function POST(req: NextRequest) {
  try {
    const { items, lang } = await req.json();

    console.log("=== Checkout API Start ===");
    console.log("Items:", items);
    console.log("Language:", lang);

    // Валидация входных данных
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!lang) {
      return NextResponse.json(
        { error: "Language parameter is required" },
        { status: 400 }
      );
    }

    // Получаем userId из Clerk
    const { userId } = await auth();

    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Получаем данные пользователя
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    console.log("User email:", user.emailAddresses[0]?.emailAddress);
    console.log("User name:", user.firstName, user.lastName);

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const locale = lang as Locale;

    // Формируем линии для корзины
    const lines = (items as CheckoutItem[]).map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    console.log("Cart lines:", lines);

    // ✅ Собираем buyerIdentity БЕЗ поля customer
    const buyerIdentity: BuyerIdentity = {
      email: userEmail,
    };

    // Добавляем телефон, если есть
    if (user.phoneNumbers && user.phoneNumbers.length > 0) {
      buyerIdentity.phone = user.phoneNumbers[0].phoneNumber;
    }

    // Если у пользователя есть адрес в метаданных Clerk
    const address = user.publicMetadata?.address as AddressMetadata | undefined;
    if (address) {
      buyerIdentity.deliveryAddressPreferences = [
        {
          deliveryAddress: {
            address1: address.address1 || "",
            address2: address.address2 || "",
            city: address.city || "",
            provinceCode: address.provinceCode || "",
            countryCode: address.countryCode || "EE",
            zip: address.zip || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phoneNumbers?.[0]?.phoneNumber || "",
          },
        },
      ];
    }

    console.log("Buyer identity:", JSON.stringify(buyerIdentity, null, 2));

    // Создаём корзину в Shopify
    const data = await shopifyFetchWithLocale<CartCreateResponse>(
      CART_CREATE,
      {
        lines,
        buyerIdentity,
      },
      locale,
      0
    );

    console.log("Shopify response:", JSON.stringify(data, null, 2));

    const { cart, userErrors } = data.cartCreate;

    if (userErrors && userErrors.length > 0) {
      console.error("cartCreate userErrors:", userErrors);
      return NextResponse.json(
        {
          error: "Cart create failed",
          details: userErrors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    if (!cart || !cart.checkoutUrl) {
      console.error("No cart or checkoutUrl in response");
      return NextResponse.json(
        { error: "Failed to create cart / checkoutUrl" },
        { status: 500 }
      );
    }

    console.log("Checkout URL:", cart.checkoutUrl);
    console.log("=== Checkout API Success ===");

    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
    });
  } catch (error) {
    console.error("=== Checkout API Error ===");
    console.error("Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to create checkout",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
