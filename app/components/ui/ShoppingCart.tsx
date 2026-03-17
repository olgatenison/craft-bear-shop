"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import type { Locale } from "../../lib/locale";

type ShoppingCartMsgs = {
  ariaLabel: string;
  emptyMessage: string;
  checkoutButton: string;
  itemsInCart: string;
};

type Messages = Record<string, unknown> & {
  ShoppingCart?: ShoppingCartMsgs;
};

const FALLBACK: ShoppingCartMsgs = {
  ariaLabel: "Shopping cart",
  emptyMessage: "Your cart is empty",
  checkoutButton: "Proceed to Checkout",
  itemsInCart: "items in cart",
};

type ShoppingCartProps = {
  lang?: Locale | string;
  href?: string;
  messages?: Messages;
  className?: string;
};

export default function ShoppingCart({
  lang,
  href,
  messages,
  className = "",
}: ShoppingCartProps) {
  const { itemCount } = useCart();

  const dict = messages?.ShoppingCart ?? FALLBACK;

  const finalHref = href || (lang ? `/${lang}/cart` : "/cart");

  const label =
    itemCount > 0
      ? `${dict.ariaLabel}: ${itemCount} ${dict.itemsInCart}`
      : `${dict.ariaLabel}: ${dict.emptyMessage}`;

  return (
    <Link
      href={finalHref}
      prefetch={false}
      aria-label={label}
      title={label}
      className={`group relative -m-2 flex items-center p-2 transition-colors ${className}`}
    >
      <ShoppingCartIcon
        aria-hidden="true"
        className="size-6 shrink-0 transition-colors"
      />

      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-gray-900">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}

      <span className="sr-only">{label}</span>
    </Link>
  );
}
