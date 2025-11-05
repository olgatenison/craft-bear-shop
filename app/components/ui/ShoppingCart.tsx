"use client";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

type ShoppingCartMsgs = {
  ariaLabel: string;
  emptyMessage: string;
  checkoutButton: string;
  itemsInCart: string; // не используется пока
};

type Messages = {
  [lang: string]: {
    ShoppingCart: ShoppingCartMsgs;
  };
};

const FALLBACK: ShoppingCartMsgs = {
  ariaLabel: "Shopping cart",
  emptyMessage: "Your cart is empty",
  checkoutButton: "Proceed to Checkout",
  itemsInCart: "items in cart, view bag",
};

export default function ShoppingCart({
  lang = "en",
  href = "/cart",
  messages,
}: {
  lang?: Locale | string; // ← реально используем импорт
  href?: string;
  messages: Messages;
}) {
  const dict =
    messages?.[lang as string]?.ShoppingCart ??
    messages?.en?.ShoppingCart ??
    FALLBACK;

  const label = `${dict.ariaLabel}: ${dict.emptyMessage}`;

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={label}
      title={label}
      className="group -m-2 flex items-center p-2"
    >
      <ShoppingCartIcon
        aria-hidden="true"
        className="size-6 shrink-0 text-gray-400 hover:text-yellow-500"
      />
      <span className="sr-only">{label}</span>
    </Link>
  );
}

// Пример:
// <ShoppingCart lang="uk" href="/cart" messages={messages} />
