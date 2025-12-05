// app/api/shopify/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetchWithLocale } from "@/app/lib/shopify/client";
import type { Locale } from "@/app/[lang]/messages";

type CheckoutItem = {
  id: string; // полный GID варианта: gid://shopify/ProductVariant/...
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

const CART_CREATE = `
  mutation CartCreate(
    $lines: [CartLineInput!]
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    cartCreate(input: { lines: $lines }) {
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

    // простая валидация входных данных
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!lang) {
      return NextResponse.json(
        { error: "Language parameter is required" },
        { status: 400 }
      );
    }

    const locale = lang as Locale;

    // id здесь уже = variant GID из корзины (product.variantId)
    const lines = (items as CheckoutItem[]).map((item) => ({
      merchandiseId: item.id,
      quantity: item.quantity,
    }));

    const data = await shopifyFetchWithLocale<CartCreateResponse>(
      CART_CREATE,
      { lines },
      locale,
      0 // checkout-запросы не кешируем
    );

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
      return NextResponse.json(
        { error: "Failed to create cart / checkoutUrl" },
        { status: 500 }
      );
    }

    // Для фронта нам достаточно checkoutUrl — редирект делаем уже на клиенте
    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout API error:", error);
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
