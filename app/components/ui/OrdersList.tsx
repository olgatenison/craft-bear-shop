// app/components/OrdersList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

export type AccountOrdersMessages = {
  title: string;
  intro: string;
  recentOrdersSrOnly: string;
  orderPlacedOnSrOnly: string;
  datePlaced: string;
  orderNumber: string;
  totalAmount: string;
  hideDetails: string;
  viewDetails: string;
  productsSrOnly: string;
  productHeader: string;
  priceHeader: string;
  statusHeader: string;
  infoHeader: string;
  viewProduct: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyCta: string;

  // Labels
  paymentStatus?: string;
  fulfillmentStatus?: string;
  shippingAddress?: string;
  trackingNumber?: string;

  // Payment translations
  paid?: string;
  pending?: string;
  refunded?: string;
  partiallyRefunded?: string;
  authorized?: string;
  unpaid?: string;
  voided?: string;
  partiallyPaid?: string;

  // Fulfillment translations
  unfulfilled?: string;
  fulfilled?: string;
  partial?: string;
  inProgress?: string;
  onHold?: string;
  scheduled?: string;
};

export type OrderProduct = {
  id: string;
  name: string;
  href: string;
  price: string;
  status: string;
  quantity?: number;
};

export type OrderForUi = {
  shopifyOrderId?: number;
  number: string; // "#1004"
  date: string;
  datetime: string;
  total: string;
  financialStatus?: string; // lower-case
  fulfillmentStatus?: string | null; // null -> unfulfilled
  shippingAddress?: {
    name: string;
    address1: string;
    city: string;
    country: string;
    zip: string;
  };
  tracking?: {
    number: string;
    url: string;
  };
  products: OrderProduct[];
};

type OrdersListProps = {
  messages: AccountOrdersMessages;
  lang: Locale;
  orders: OrderForUi[];
};

function badgeClass(bgColor: string, color: string) {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${color}`;
}

// Payment badge (Shopify financial_status)
function getPaymentStatusBadge(
  status: string | undefined,
  messages: AccountOrdersMessages,
) {
  if (!status) return null;

  const s = status.toLowerCase();

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    paid: {
      label: messages.paid || "Paid",
      color: "text-green-700",
      bg: "bg-green-100",
    },
    pending: {
      label: messages.pending || "Pending",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    authorized: {
      label: messages.authorized || "Authorized",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    unpaid: {
      label: messages.unpaid || "Unpaid",
      color: "text-red-700",
      bg: "bg-red-100",
    },
    partially_paid: {
      label: messages.partiallyPaid || "Partially paid",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    refunded: {
      label: messages.refunded || "Refunded",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    partially_refunded: {
      label: messages.partiallyRefunded || "Partially refunded",
      color: "text-orange-700",
      bg: "bg-orange-100",
    },
    voided: {
      label: messages.voided || "Voided",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
  };

  const cfg = statusConfig[s] || {
    label: s,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };

  return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
}

// Fulfillment badge (Shopify fulfillment_status) — Shopify null => Unfulfilled
function getFulfillmentStatusBadge(
  status: string | null | undefined,
  messages: AccountOrdersMessages,
) {
  const s = (status ?? "unfulfilled").toLowerCase();

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    unfulfilled: {
      label: messages.unfulfilled || "Unfulfilled",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    fulfilled: {
      label: messages.fulfilled || "Fulfilled",
      color: "text-green-700",
      bg: "bg-green-100",
    },
    partial: {
      label: messages.partial || "Partially fulfilled",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    in_progress: {
      label: messages.inProgress || "In progress",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    on_hold: {
      label: messages.onHold || "On hold",
      color: "text-orange-700",
      bg: "bg-orange-100",
    },
    scheduled: {
      label: messages.scheduled || "Scheduled",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
  };

  const cfg = statusConfig[s] || {
    label: s,
    color: "text-gray-700",
    bg: "bg-gray-100",
  };

  return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
}

export default function OrdersList({
  messages,
  lang,
  orders,
}: OrdersListProps) {
  const [openOrderNumber, setOpenOrderNumber] = useState<string | null>(null);

  const toggleOrder = (number: string) => {
    setOpenOrderNumber((current) => (current === number ? null : number));
  };

  const hasOrders = orders.length > 0;

  return (
    <main className="mt-10 space-y-6 lg:col-span-8 lg:mt-0">
      <div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {messages.title}
            </h1>
            <p className="mt-4 text-base text-gray-400">{messages.intro}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="sr-only">{messages.recentOrdersSrOnly}</h2>

          {!hasOrders ? (
            <div className="py-16">
              <p className="text-lg text-gray-400">{messages.emptyTitle}</p>
              <p className="my-2 text-gray-500">{messages.emptyDescription}</p>
              <Link
                href={`/${lang}/shop`}
                className="relative mt-10 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {messages.emptyCta}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const isOpen = openOrderNumber === order.number;
                const detailsId = `order-${order.number}-details`;

                return (
                  <div key={order.number}>
                    <h3 className="sr-only">
                      {messages.orderPlacedOnSrOnly}{" "}
                      <time dateTime={order.datetime}>{order.date}</time>
                    </h3>

                    {/* Order header */}
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-6 text-sm text-gray-200 sm:px-6">
                      <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                        {/* Main info */}
                        <dl className="flex-auto divide-y divide-gray-700 text-sm sm:grid sm:grid-cols-3 sm:gap-x-6 sm:divide-y-0 lg:flex-none lg:gap-x-8">
                          <div className="flex justify-between py-3 first:pt-0 last:pb-0 sm:block sm:py-0">
                            <dt className="font-medium text-gray-400">
                              {messages.datePlaced}
                            </dt>
                            <dd className="text-white sm:mt-1">
                              <time dateTime={order.datetime}>
                                {order.date}
                              </time>
                            </dd>
                          </div>

                          <div className="flex justify-between py-3 first:pt-0 last:pb-0 sm:block sm:py-0">
                            <dt className="font-medium text-gray-400">
                              {messages.orderNumber}
                            </dt>
                            <dd className="text-white sm:mt-1">
                              {order.number}
                            </dd>
                          </div>

                          <div className="flex justify-between py-3 first:pt-0 last:pb-0 sm:block sm:py-0">
                            <dt className="font-medium text-gray-400">
                              {messages.totalAmount}
                            </dt>
                            <dd className="font-medium text-yellow-400 sm:mt-1">
                              {order.total}
                            </dd>
                          </div>
                        </dl>

                        {/* Statuses + toggle */}
                        <div className="mt-6 space-y-4 sm:ml-6 sm:mt-0 sm:w-auto sm:flex-none">
                          {/* Payment */}
                          {order.financialStatus && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {messages.paymentStatus || "Payment"}:
                              </span>
                              {getPaymentStatusBadge(
                                order.financialStatus,
                                messages,
                              )}
                            </div>
                          )}

                          {/* Fulfillment */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {messages.fulfillmentStatus || "Fulfillment"}:
                            </span>
                            {getFulfillmentStatusBadge(
                              order.fulfillmentStatus,
                              messages,
                            )}
                          </div>

                          {/* Tracking — ВАЖНО: показываем в шапке */}
                          {order.tracking?.number && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {messages.trackingNumber || "Tracking"}:
                              </span>

                              {order.tracking.url ? (
                                <a
                                  href={order.tracking.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-yellow-400 hover:text-yellow-300"
                                >
                                  {order.tracking.number}
                                </a>
                              ) : (
                                <span className="text-xs text-white">
                                  {order.tracking.number}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Toggle details */}
                          <button
                            type="button"
                            onClick={() => toggleOrder(order.number)}
                            aria-expanded={isOpen}
                            aria-controls={detailsId}
                            className="flex w-full items-center justify-center rounded-md border border-white/25 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 sm:w-auto"
                          >
                            {isOpen
                              ? messages.hideDetails
                              : messages.viewDetails}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    {isOpen && (
                      <div
                        id={detailsId}
                        className="mt-4 space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
                      >
                        {/* Shipping address */}
                        {order.shippingAddress && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">
                              {messages.shippingAddress || "Shipping Address"}
                            </h4>
                            <div className="mt-2 text-sm text-white">
                              <p>{order.shippingAddress.name}</p>
                              <p>{order.shippingAddress.address1}</p>
                              <p>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.zip}
                              </p>
                              <p>{order.shippingAddress.country}</p>
                            </div>
                          </div>
                        )}

                        {/* Tracking (details — оставляем тоже) */}
                        {order.tracking?.number && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-400">
                              {messages.trackingNumber || "Tracking Number"}
                            </h4>
                            <div className="mt-2">
                              {order.tracking.url ? (
                                <a
                                  href={order.tracking.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-yellow-400 hover:text-yellow-300"
                                >
                                  {order.tracking.number}
                                </a>
                              ) : (
                                <p className="text-sm text-white">
                                  {order.tracking.number}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Products */}
                        <div>
                          <h4 className="mb-4 text-sm font-medium text-gray-400">
                            {messages.productHeader || "Products"}
                          </h4>

                          <div className="space-y-4">
                            {order.products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                              >
                                {/* вместо картинки */}
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-gray-300">
                                  {product.quantity ?? 1}x
                                </div>

                                <div className="flex-1 space-y-1">
                                  <h5 className="font-medium text-white">
                                    {product.name}
                                  </h5>
                                  <p className="text-sm text-gray-400">
                                    {messages.priceHeader || "Price"}:{" "}
                                    {product.price}
                                  </p>
                                  {product.quantity != null && (
                                    <p className="text-sm text-gray-400">
                                      Quantity: {product.quantity}
                                    </p>
                                  )}
                                </div>

                                <a
                                  href={product.href}
                                  className="text-sm font-medium text-yellow-400 transition-colors hover:text-yellow-300"
                                >
                                  {messages.viewProduct}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
