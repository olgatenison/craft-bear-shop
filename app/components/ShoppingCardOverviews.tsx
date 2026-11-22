"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import {
  QuestionMarkCircleIcon,
  XMarkIcon as XMarkIconMini,
} from "@heroicons/react/20/solid";

import { useCart } from "@/app/context/CartContext";
import type { Locale } from "../lib/locale";

// -------------------------------------------
// TYPES
// -------------------------------------------

type ShoppingCardOverviewsProps = {
  shoppingCart: string;
  description: string;
  orderSummary: string;
  subtotal: string;
  shippingEstimate: string;
  taxEstimate: string;
  total: string;
  checkout: string;
  shippingEstimateInfo: string;
  taxEstimateInfo: string;
  empty: string;
  emptyDescription: string;
  CTAAdd: string;
  lang: Locale;
  continueShopping: string;

  shippingPending: string;
  shippingModalTitle: string;
  shippingModalDescription: string;
  shippingModalNotice: string;
  shippingModalConfirm: string;
  shippingModalCancel: string;
  shippingTotalWithoutDelivery: string;
  checkoutError: string;

  shippingCountryLabel: string;
  shippingCountryEstonia: string;
  shippingCountryFinland: string;
  shippingCountryLatvia: string;
  shippingCountryLithuania: string;
  shippingCountryOther: string;
  shippingCountryCodeLabel: string;

  shippingAddressTitle: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;

  shippingDraftSubmit: string;
  shippingDraftSuccess: string;
  shippingDraftError: string;

  shippingActiveDraftTitle: string;
  shippingActiveDraftDescription: string;
};

type ShippingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  phone: string;
};

type DraftOrderResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  draftOrderName?: string;
  draftOrderStatus?: string;
  orderNumber?: string;
};

type CheckoutResponse = {
  checkoutUrl?: string;
  error?: string;
};

const initialAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  zip: "",
  phone: "",
};

// -------------------------------------------
// COMPONENT
// -------------------------------------------

export default function ShoppingCardOverviews({
  shoppingCart,
  description,
  orderSummary,
  subtotal,
  shippingEstimate,
  total,
  checkout,
  shippingEstimateInfo,
  empty,
  emptyDescription,
  CTAAdd,
  lang,
  continueShopping,

  shippingPending,
  shippingModalTitle,
  shippingModalDescription,
  shippingModalNotice,
  shippingModalCancel,
  shippingTotalWithoutDelivery,
  checkoutError,

  shippingCountryLabel,
  shippingCountryEstonia,
  shippingCountryFinland,
  shippingCountryLatvia,
  shippingCountryLithuania,
  shippingCountryOther,
  shippingCountryCodeLabel,

  shippingAddressTitle,
  shippingFirstName,
  shippingLastName,
  shippingAddress1,
  shippingAddress2,
  shippingCity,
  shippingPostalCode,
  shippingPhone,

  shippingDraftSubmit,
  shippingDraftSuccess,
  shippingDraftError,

  shippingActiveDraftTitle,
  shippingActiveDraftDescription,
}: ShoppingCardOverviewsProps) {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } =
    useCart();

  // -------------------------------------------
  // STATE
  // -------------------------------------------

  const [countrySelection, setCountrySelection] = useState("EE");

  const [otherCountryCode, setOtherCountryCode] = useState("");

  const [showShippingModal, setShowShippingModal] = useState(false);

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [draftSuccess, setDraftSuccess] = useState<string | null>(null);

  const [draftError, setDraftError] = useState<string | null>(null);

  const [activeDraftOrder, setActiveDraftOrder] = useState<string | null>(null);

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>(initialAddress);

  // -------------------------------------------
  // SHIPPING COUNTRY
  // -------------------------------------------

  const countryCode =
    countrySelection === "OTHER"
      ? otherCountryCode.trim().toUpperCase()
      : countrySelection;

  const updateAddress = (key: keyof ShippingAddress, value: string) => {
    setShippingAddress((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // -------------------------------------------
  // SHIPPING AND TOTAL
  // -------------------------------------------

  const hasItems = items.length > 0;

  // Estonia:
  // Up to 50 EUR -> standard Shopify Checkout.
  // Over 50 EUR -> Draft Order.
  //
  // Other countries:
  // Any order amount -> Draft Order.

  const requiresShippingQuote = countryCode !== "EE" || totalPrice > 50;

  // Standard shipping within Estonia:
  // 6 EUR for orders up to 50 EUR.

  const shippingCost = hasItems && !requiresShippingQuote ? 6 : 0;

  // IMPORTANT:
  // Shopify prices already include VAT.
  // Do not add another 8.4% or 24%.
  //
  // Shopify is responsible for calculating
  // the final tax treatment at checkout.

  const orderTotal = totalPrice + shippingCost;

  // -------------------------------------------
  // MODAL EFFECTS
  // -------------------------------------------

  useEffect(() => {
    if (!showShippingModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowShippingModal(false);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
    };
  }, [showShippingModal]);

  // -------------------------------------------
  // AUTH REDIRECT
  // -------------------------------------------

  const redirectToAccount = () => {
    const cartUrl = `/${lang}/cart`;

    const accountUrl =
      `/${lang}/account?redirect_url=` + encodeURIComponent(cartUrl);

    router.push(accountUrl);
  };

  // -------------------------------------------
  // STANDARD SHOPIFY CHECKOUT
  // -------------------------------------------

  const proceedToCheckout = async () => {
    if (!items.length || isCheckingOut) return;

    if (!isSignedIn) {
      redirectToAccount();
      return;
    }

    if (requiresShippingQuote) {
      setShowShippingModal(true);
      return;
    }

    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lang,
          countryCode,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok || !result.checkoutUrl) {
        console.error("Checkout error:", result);

        alert(checkoutError);
        return;
      }

      // Do not clear the cart before payment.
      // The user may return without paying.

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      console.error("Checkout request failed:", error);

      alert(checkoutError);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // -------------------------------------------
  // CHECKOUT BUTTON
  // -------------------------------------------

  const handleCheckout = () => {
    if (!items.length || isCheckingOut) return;

    setDraftError(null);
    setDraftSuccess(null);

    if (countrySelection === "OTHER" && !/^[A-Z]{2}$/.test(countryCode)) {
      setDraftError(shippingDraftError);
      return;
    }

    if (!isSignedIn) {
      redirectToAccount();
      return;
    }

    if (requiresShippingQuote) {
      setShowShippingModal(true);
      return;
    }

    void proceedToCheckout();
  };

  // -------------------------------------------
  // CREATE SHOPIFY DRAFT ORDER
  // -------------------------------------------

  const submitDraftOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length || isCheckingOut || activeDraftOrder) {
      return;
    }

    if (!isSignedIn) {
      redirectToAccount();
      return;
    }

    if (!/^[A-Z]{2}$/.test(countryCode)) {
      setDraftError(shippingDraftError);
      return;
    }

    setIsCheckingOut(true);
    setDraftError(null);

    try {
      const response = await fetch("/api/shopify/draft-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            ...shippingAddress,
            countryCode,
          },
        }),
      });

      const result = (await response.json()) as DraftOrderResponse;

      // ---------------------------------------
      // EXISTING ACTIVE DRAFT ORDER
      // ---------------------------------------

      if (
        response.status === 409 &&
        result.error === "ACTIVE_DRAFT_ORDER_EXISTS"
      ) {
        const orderNumber =
          typeof result.draftOrderName === "string"
            ? result.draftOrderName
            : "";

        setActiveDraftOrder(orderNumber);

        // This is not a technical error.
        // The request has already been received.

        setDraftError(null);
        return;
      }

      // ---------------------------------------
      // OTHER ERRORS
      // ---------------------------------------

      if (!response.ok || !result.success) {
        console.error("Draft Order error:", result);

        setDraftError(shippingDraftError);
        return;
      }

      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      // No payment has been collected.
      // Manager will confirm shipping later.

      setShowShippingModal(false);
      setDraftSuccess(shippingDraftSuccess);
      setDraftError(null);

      // Clear the cart only after Shopify
      // confirms the Draft Order was created.

      clearCart();
    } catch (error) {
      console.error("Draft Order request failed:", error);

      setDraftError(shippingDraftError);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // -------------------------------------------
  // ACTIVE DRAFT ORDER MESSAGE
  // -------------------------------------------

  const activeDraftTitle = shippingActiveDraftTitle.replace(
    "{orderNumber}",
    activeDraftOrder ?? "",
  );

  // -------------------------------------------
  // RENDER
  // -------------------------------------------

  return (
    <div>
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight text-yellow-400">
          {shoppingCart}
        </h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* -------------------------------- */}
          {/* CART ITEMS */}
          {/* -------------------------------- */}

          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              {description}
            </h2>

            {!hasItems ? (
              <div className="py-16">
                <p className="text-lg text-gray-400">{empty}</p>

                <p className="my-2 text-gray-500">{emptyDescription}</p>

                <Link
                  href={`/${lang}/shop`}
                  className="relative mt-10 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {CTAAdd}
                </Link>
              </div>
            ) : (
              <>
                <ul
                  role="list"
                  className="divide-y divide-gray-200 border-b border-t border-gray-200"
                >
                  {items.map((product) => {
                    const lineTotal = product.price * product.quantity;

                    const href = `/${lang}/product/` + product.handle;

                    return (
                      <li key={product.id} className="flex py-6 sm:py-10">
                        {/* PRODUCT IMAGE */}

                        <Link
                          href={href}
                          className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-stone-600 transition-opacity hover:opacity-90 sm:size-48"
                          aria-label={product.name}
                        >
                          <Image
                            width={640}
                            height={640}
                            alt={product.imageAlt}
                            src={product.imageSrc}
                            className="h-full w-full object-contain p-3"
                          />
                        </Link>

                        {/* PRODUCT DETAILS */}

                        <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                          <div className="relative pr-0 xs:pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                            <div>
                              <h3 className="pr-6 text-lg font-medium text-white">
                                <Link
                                  href={href}
                                  className="font-medium text-yellow-400 transition-colors hover:text-yellow-300"
                                >
                                  {product.name}
                                </Link>

                                {product.size && (
                                  <span className="block text-sm text-gray-300">
                                    ({product.size})
                                  </span>
                                )}
                              </h3>

                              <div className="mt-1 flex flex-wrap gap-x-4 text-base text-gray-200">
                                {product.country && (
                                  <p className="text-gray-300">
                                    {product.country}
                                  </p>
                                )}

                                {product.abv && (
                                  <p className="text-gray-300">
                                    <span className="hidden sm:inline">| </span>
                                    {product.abv}%
                                  </p>
                                )}
                              </div>

                              <p className="mt-1 text-sm text-gray-400">
                                {product.price.toFixed(2)} €{" "}
                                {product.size ? `/ ${product.size}` : ""}
                              </p>
                            </div>

                            {/* QUANTITY CONTROLS */}

                            <div className="mt-3 ml-auto flex w-fit flex-col gap-3 xs:absolute xs:right-0 xs:top-0 xs:mt-4 sm:mt-0 sm:pr-9">
                              <div className="flex items-center justify-end gap-3">
                                <p className="text-base font-medium text-gray-300">
                                  {lineTotal.toFixed(2)} €
                                </p>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(product.id)}
                                  className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                                  aria-label="Remove"
                                >
                                  <XMarkIconMini
                                    aria-hidden="true"
                                    className="size-5"
                                  />
                                </button>
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      product.quantity - 1,
                                    )
                                  }
                                  className="flex size-8 items-center justify-center rounded-md border border-gray-400 text-gray-300 transition-colors hover:bg-white/10"
                                >
                                  <span className="sr-only">
                                    Decrease quantity
                                  </span>
                                  <span className="text-lg font-medium">−</span>
                                </button>

                                <span className="w-8 text-center text-base text-gray-200">
                                  {product.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      product.quantity + 1,
                                    )
                                  }
                                  className="flex size-8 items-center justify-center rounded-md border border-gray-400 text-gray-300 transition-colors hover:bg-white/10"
                                >
                                  <span className="sr-only">
                                    Increase quantity
                                  </span>
                                  <span className="text-lg font-medium">+</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* CONTINUE SHOPPING */}

                <div className="mt-8">
                  <Link
                    href={`/${lang}/shop`}
                    className="inline-flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {continueShopping}
                  </Link>
                </div>
              </>
            )}
          </section>

          {/* -------------------------------- */}
          {/* ORDER SUMMARY */}
          {/* -------------------------------- */}

          {hasItems && (
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg border border-white/10 bg-white/5 p-3 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2
                id="summary-heading"
                className="whitespace-nowrap text-lg font-semibold text-white"
              >
                {orderSummary}
              </h2>

              {/* SHIPPING COUNTRY */}

              <div className="mt-6">
                <label
                  htmlFor="shipping-country"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  {shippingCountryLabel}
                </label>

                <select
                  id="shipping-country"
                  value={countrySelection}
                  onChange={(event) => {
                    setCountrySelection(event.target.value);

                    setDraftError(null);
                    setDraftSuccess(null);
                  }}
                  className="w-full rounded-md border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:border-yellow-400"
                >
                  <option value="EE">{shippingCountryEstonia}</option>

                  <option value="FI">{shippingCountryFinland}</option>

                  <option value="LV">{shippingCountryLatvia}</option>

                  <option value="LT">{shippingCountryLithuania}</option>

                  <option value="OTHER">{shippingCountryOther}</option>
                </select>

                {countrySelection === "OTHER" && (
                  <input
                    aria-label={shippingCountryCodeLabel}
                    value={otherCountryCode}
                    onChange={(event) =>
                      setOtherCountryCode(
                        event.target.value
                          .replace(/[^a-z]/gi, "")
                          .slice(0, 2)
                          .toUpperCase(),
                      )
                    }
                    placeholder={shippingCountryCodeLabel}
                    maxLength={2}
                    required
                    className="mt-2 w-full rounded-md border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-yellow-400"
                  />
                )}
              </div>

              <dl className="mt-6 space-y-4 pb-8">
                {/* SUBTOTAL */}

                <div className="flex items-center justify-between">
                  <dt className="text-base text-gray-300">{subtotal}</dt>

                  <dd className="text-sm font-medium text-gray-300">
                    {totalPrice.toFixed(2)} €
                  </dd>
                </div>

                {/* SHIPPING */}

                <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-base text-gray-400">
                    <span>{shippingEstimate}</span>

                    <Link
                      href={`/${lang}/delivery`}
                      title={shippingEstimateInfo}
                      aria-label={shippingEstimateInfo}
                      className="ml-2 shrink-0 text-gray-400 transition-colors hover:text-yellow-400 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                    >
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="size-5"
                      />
                    </Link>
                  </dt>

                  <dd className="text-right text-base font-medium text-gray-400">
                    {requiresShippingQuote ? (
                      <span className="text-sm font-medium text-yellow-400">
                        {shippingPending}
                      </span>
                    ) : (
                      `${shippingCost.toFixed(2)} €`
                    )}
                  </dd>
                </div>

                {/* TOTAL - VAT ALREADY INCLUDED */}

                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-yellow-400">
                    {total}
                  </dt>

                  <dd className="text-base font-medium text-yellow-400">
                    {orderTotal.toFixed(2)} €
                  </dd>
                </div>

                {/* SHIPPING NOTICE */}

                {requiresShippingQuote && (
                  <div className="rounded-md border border-yellow-400/20 bg-yellow-400/5 p-3">
                    <p className="text-xs leading-5 text-yellow-100/80">
                      {shippingTotalWithoutDelivery}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-400">
                      {shippingModalNotice}
                    </p>
                  </div>
                )}
              </dl>

              {/* ACTIVE DRAFT NOTICE */}

              {activeDraftOrder && requiresShippingQuote && (
                <div
                  role="status"
                  className="rounded-md border border-yellow-400/30 bg-yellow-400/10 p-4"
                >
                  <p className="font-semibold text-yellow-300">
                    {activeDraftTitle}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-yellow-100/80">
                    {shippingActiveDraftDescription}
                  </p>
                </div>
              )}

              {/* GENERAL ERROR */}

              {draftError && !showShippingModal && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                  {draftError}
                </p>
              )}

              {/* CHECKOUT BUTTON */}

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    isCheckingOut ||
                    (requiresShippingQuote && activeDraftOrder !== null)
                  }
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-semibold text-gray-900 transition-colors duration-300 hover:border-yellow-600 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto lg:w-full"
                >
                  {checkout}
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* -------------------------------- */}
      {/* DRAFT ORDER SUCCESS */}
      {/* -------------------------------- */}

      {draftSuccess && (
        <div
          role="status"
          className="mx-auto mb-8 max-w-2xl rounded-lg border border-yellow-400/30 bg-yellow-400/10 p-4 text-yellow-200"
        >
          {draftSuccess}
        </div>
      )}

      {/* -------------------------------- */}
      {/* SHIPPING MODAL */}
      {/* -------------------------------- */}

      {showShippingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowShippingModal(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipping-modal-title"
            className="relative my-auto w-full max-w-lg rounded-xl border border-white/10 bg-neutral-900 p-6 text-white shadow-2xl sm:p-8"
          >
            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setShowShippingModal(false)}
              aria-label={shippingModalCancel}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <XMarkIconMini className="size-6" />
            </button>

            {/* ACTIVE DRAFT MESSAGE */}

            {activeDraftOrder ? (
              <div className="pr-5">
                <h2
                  id="shipping-modal-title"
                  className="text-xl font-semibold text-yellow-400"
                >
                  {activeDraftTitle}
                </h2>

                <p className="mt-4 text-sm leading-6 text-gray-300">
                  {shippingActiveDraftDescription}
                </p>

                <button
                  type="button"
                  onClick={() => setShowShippingModal(false)}
                  className="mt-6 w-full rounded-md bg-yellow-400 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-yellow-300"
                >
                  {shippingModalCancel}
                </button>
              </div>
            ) : (
              <>
                {/* TITLE */}

                <h2
                  id="shipping-modal-title"
                  className="pr-6 text-xl font-semibold text-yellow-400"
                >
                  {shippingModalTitle}
                </h2>

                {/* DESCRIPTION */}

                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {shippingModalDescription}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-400">
                  {shippingModalNotice}
                </p>

                {/* ADDRESS TITLE */}

                <h3 className="mt-5 text-base font-semibold text-white">
                  {shippingAddressTitle}
                </h3>

                {/* ADDRESS FORM */}

                <form onSubmit={submitDraftOrder} className="mt-3 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["firstName", shippingFirstName],
                        ["lastName", shippingLastName],
                        ["address1", shippingAddress1],
                        ["address2", shippingAddress2],
                        ["city", shippingCity],
                        ["zip", shippingPostalCode],
                        ["phone", shippingPhone],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="block text-xs text-gray-300">
                        {label}

                        <input
                          type={key === "phone" ? "tel" : "text"}
                          value={shippingAddress[key]}
                          required={key !== "address2" && key !== "phone"}
                          onChange={(event) =>
                            updateAddress(key, event.target.value)
                          }
                          autoComplete={
                            key === "firstName"
                              ? "given-name"
                              : key === "lastName"
                                ? "family-name"
                                : key === "address1"
                                  ? "address-line1"
                                  : key === "address2"
                                    ? "address-line2"
                                    : key === "city"
                                      ? "address-level2"
                                      : key === "zip"
                                        ? "postal-code"
                                        : "tel"
                          }
                          className="mt-1 w-full rounded-md border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
                        />
                      </label>
                    ))}
                  </div>

                  {/* OTHER COUNTRY CODE */}

                  {countrySelection === "OTHER" && (
                    <label className="block text-xs text-gray-300">
                      {shippingCountryCodeLabel}

                      <input
                        value={otherCountryCode}
                        maxLength={2}
                        required
                        onChange={(event) =>
                          setOtherCountryCode(
                            event.target.value
                              .replace(/[^a-z]/gi, "")
                              .slice(0, 2)
                              .toUpperCase(),
                          )
                        }
                        className="mt-1 w-full rounded-md border border-white/20 bg-neutral-800 px-3 py-2 text-sm text-white"
                      />
                    </label>
                  )}

                  {/* ERROR */}

                  {draftError && (
                    <p role="alert" className="text-sm text-red-400">
                      {draftError}
                    </p>
                  )}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full rounded-md bg-yellow-400 px-5 py-3 text-sm font-semibold text-neutral-900 hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCheckingOut ? "…" : shippingDraftSubmit}
                  </button>

                  {/* CANCEL */}

                  <button
                    type="button"
                    onClick={() => setShowShippingModal(false)}
                    className="w-full text-center text-sm text-gray-400 hover:text-white"
                  >
                    {shippingModalCancel}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
