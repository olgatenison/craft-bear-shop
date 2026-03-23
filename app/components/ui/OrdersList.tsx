"use client";

import { useMemo, useState } from "react";
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

  paymentStatus: string;
  fulfillmentStatus: string;
  shippingAddress: string;
  trackingNumber: string;
  quantity: string;

  paid: string;
  pending: string;
  refunded: string;
  partiallyRefunded: string;
  authorized: string;
  unpaid: string;
  voided: string;
  partiallyPaid: string;

  unfulfilled: string;
  fulfilled: string;
  partial: string;
  inProgress: string;
  onHold: string;
  scheduled: string;

  stepPlaced: string;
  stepPaid: string;
  stepProcessing: string;
  stepShipped: string;
  stepDelivered: string;

  statusCancelled: string;
  statusRefunded: string;
  statusPartiallyRefunded: string;

  page: string;
  of: string;
  showing: string;
  prev: string;
  next: string;
};

export type OrderProduct = {
  id: string;
  name: string;
  handle?: string | null;
  href?: string | null;
  price: string;
  status: string;
  quantity?: number;
};

export type OrderForUi = {
  shopifyOrderId?: number;
  number: string;
  date: string;
  datetime: string;
  total: string;
  financialStatus?: string;
  fulfillmentStatus?: string | null;
  cancelledAt?: string | null;
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

function getNormalStep(order: OrderForUi): number {
  const pay = (order.financialStatus ?? "").toLowerCase();
  const ful = (order.fulfillmentStatus ?? "").toLowerCase();

  if (ful === "fulfilled") return 4;
  if (order.tracking?.number) return 3;
  if (["partial", "in_progress", "on_hold", "scheduled"].includes(ful)) {
    return 2;
  }
  if (["paid", "authorized", "partially_paid"].includes(pay)) return 1;
  return 0;
}

type SpecialStatus = "cancelled" | "refunded" | "partially_refunded" | null;

function getSpecialStatus(order: OrderForUi): SpecialStatus {
  if (order.cancelledAt) return "cancelled";

  const pay = (order.financialStatus ?? "").toLowerCase();
  if (pay === "refunded") return "refunded";
  if (pay === "partially_refunded") return "partially_refunded";

  return null;
}

function FulfillmentProgress({
  order,
  messages,
}: {
  order: OrderForUi;
  messages: AccountOrdersMessages;
}) {
  const currentStep = getNormalStep(order);

  const steps = [
    messages.stepPlaced,
    messages.stepPaid,
    messages.stepProcessing,
    messages.stepShipped,
    messages.stepDelivered,
  ];

  return (
    <div className="mb-6">
      <div className="sm:hidden">
        <div className="space-y-3">
          {steps.map((label, i) => {
            const isDone = i < currentStep;
            const isCurrent = i === currentStep;
            const isActive = i <= currentStep;
            const isLast = i === steps.length - 1;

            return (
              <div key={i} className="flex items-start gap-3">
                <div className="flex min-h-8 flex-col items-center">
                  <div
                    className={[
                      "rounded-full border-2 transition-all duration-300",
                      isCurrent
                        ? "h-3.5 w-3.5 border-yellow-400 bg-yellow-400 ring-2 ring-yellow-400/40 ring-offset-2 ring-offset-[#111111]"
                        : isActive
                          ? "h-3.5 w-3.5 border-yellow-400 bg-yellow-400"
                          : "h-3.5 w-3.5 border-white/20 bg-transparent",
                    ].join(" ")}
                  />
                  {!isLast && (
                    <div
                      className={[
                        "mt-1 w-px flex-1 min-h-6",
                        isDone ? "bg-yellow-400" : "bg-white/10",
                      ].join(" ")}
                    />
                  )}
                </div>

                <div className="min-w-0 pt-0.5">
                  <p
                    className={[
                      "text-sm leading-tight",
                      isCurrent
                        ? "font-semibold text-yellow-400"
                        : isActive
                          ? "text-white"
                          : "text-gray-400",
                    ].join(" ")}
                  >
                    {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="flex items-center">
          {steps.map((_, i) => {
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;
            const segmentActive = i < currentStep;

            return (
              <div
                key={i}
                className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
              >
                <div
                  className={[
                    "shrink-0 rounded-full border-2 transition-all duration-300",
                    isCurrent
                      ? "h-3 w-3 border-yellow-400 bg-yellow-400 ring-2 ring-yellow-400/40 ring-offset-1 ring-offset-[#1a1a1a]"
                      : isActive
                        ? "h-3 w-3 border-yellow-400 bg-yellow-400"
                        : "h-3 w-3 border-white/20 bg-transparent",
                  ].join(" ")}
                />

                {i < steps.length - 1 && (
                  <div
                    className="h-0.5 flex-1 transition-all duration-500"
                    style={{
                      background: segmentActive
                        ? "#facc15"
                        : "rgba(255,255,255,0.1)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex">
          {steps.map((label, i) => {
            const isActive = i <= currentStep;

            return (
              <div
                key={i}
                className={[
                  i < steps.length - 1 ? "flex-1" : "",
                  "flex justify-start",
                ].join(" ")}
              >
                <span
                  className={[
                    "whitespace-nowrap text-[10px] leading-tight",
                    isActive
                      ? "font-semibold text-yellow-400"
                      : "text-gray-400",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SpecialStatusBanner({
  type,
  messages,
}: {
  type: Exclude<SpecialStatus, null>;
  messages: AccountOrdersMessages;
}) {
  const config = {
    cancelled: {
      label: messages.statusCancelled,
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      dot: "bg-red-400",
    },
    refunded: {
      label: messages.statusRefunded,
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
      text: "text-gray-400",
      dot: "bg-gray-400",
    },
    partially_refunded: {
      label: messages.statusPartiallyRefunded,
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      text: "text-orange-400",
      dot: "bg-orange-400",
    },
  }[type];

  return (
    <div
      className={`mb-6 flex items-center gap-2 rounded-lg border px-3 py-2 ${config.bg} ${config.border}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className={`text-xs font-medium ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}

function OrderStatusLabel({
  order,
  messages,
}: {
  order: OrderForUi;
  messages: AccountOrdersMessages;
}) {
  const special = getSpecialStatus(order);

  if (special) {
    const cfg = {
      cancelled: {
        label: messages.statusCancelled,
        className: "text-red-400",
      },
      refunded: {
        label: messages.statusRefunded,
        className: "text-gray-400",
      },
      partially_refunded: {
        label: messages.statusPartiallyRefunded,
        className: "text-orange-400",
      },
    }[special];

    return (
      <span className={`text-xs font-medium ${cfg.className}`}>
        {cfg.label}
      </span>
    );
  }

  const step = getNormalStep(order);
  const labels = [
    messages.stepPlaced,
    messages.stepPaid,
    messages.stepProcessing,
    messages.stepShipped,
    messages.stepDelivered,
  ];
  const colors = [
    "text-gray-400",
    "text-white",
    "text-white",
    "text-white",
    "text-yellow-400",
  ];

  return (
    <span className={`text-xs font-medium ${colors[step]}`}>
      {labels[step]}
    </span>
  );
}

export default function OrdersList({
  messages,
  lang,
  orders,
}: OrdersListProps) {
  const [openOrderNumber, setOpenOrderNumber] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const limit = 5;
  const total = orders.length;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    return orders.slice(start, end);
  }, [orders, page]);

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    setOpenOrderNumber(null);
  };

  const toggleOrder = (n: string) => {
    setOpenOrderNumber((cur) => (cur === n ? null : n));
  };

  const hasOrders = orders.length > 0;

  return (
    <main className="mt-10 space-y-6 lg:col-span-8 lg:mt-0">
      <div>
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">
              {messages.title}
            </h1>
            <p className="mt-4 text-base text-gray-400">{messages.intro}</p>
          </div>

          {hasOrders && (
            <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
              <span className="text-sm text-gray-400">
                {`${messages.page} ${page} ${messages.of} ${totalPages}`}
              </span>

              <button
                type="button"
                className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
              >
                {messages.prev}
              </button>

              <button
                type="button"
                className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
              >
                {messages.next}
              </button>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="sr-only">{messages.recentOrdersSrOnly}</h2>

          {!hasOrders ? (
            <div className="py-16">
              <p className="text-lg text-gray-400">{messages.emptyTitle}</p>
              <p className="my-2 text-gray-400">{messages.emptyDescription}</p>
              <Link
                href={`/${lang}/shop`}
                className="relative mt-10 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {messages.emptyCta}
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedOrders.map((order) => {
                  const isOpen = openOrderNumber === order.number;
                  const detailsId = `order-${order.number}-details`;
                  const special = getSpecialStatus(order);

                  return (
                    <div key={order.number}>
                      <h3 className="sr-only">
                        {messages.orderPlacedOnSrOnly}{" "}
                        <time dateTime={order.datetime}>{order.date}</time>
                      </h3>

                      <div className="grid grid-cols-1 gap-4 border-b border-gray-400/70 pb-6 sm:grid-cols-[200px_minmax(0,2fr)_220px] sm:items-start">
                        <div className="text-xs">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-400">
                              {messages.datePlaced}
                            </div>
                            <div className="text-white">
                              <time dateTime={order.datetime}>
                                {order.date}
                              </time>
                            </div>
                          </div>

                          <div className="mt-6 space-y-1">
                            <div className="text-gray-400">
                              {messages.orderNumber}
                            </div>
                            <div className="wrap-break-word text-gray-400">
                              {order.number}
                            </div>
                          </div>
                        </div>

                        <div className="w-full min-w-0 space-y-3 md:pl-10 lg:justify-self-stretch">
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-gray-400">
                              {messages.totalAmount}
                            </div>
                            <div className="text-base font-semibold text-yellow-400">
                              {order.total}
                            </div>
                          </div>

                          <OrderStatusLabel order={order} messages={messages} />

                          {order.tracking?.number && (
                            <div className="mt-2 min-w-0">
                              <div className="text-xs text-gray-400">
                                {messages.trackingNumber}:
                              </div>
                              {order.tracking.url ? (
                                <a
                                  href={order.tracking.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all text-xs text-white"
                                >
                                  {order.tracking.number}
                                </a>
                              ) : (
                                <span className="break-all text-xs text-white">
                                  {order.tracking.number}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleOrder(order.number)}
                          aria-expanded={isOpen}
                          aria-controls={detailsId}
                          className="flex h-9 w-full items-center justify-center whitespace-nowrap rounded-md border border-gray-500/70 px-4 text-xs leading-none text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          {isOpen ? messages.hideDetails : messages.viewDetails}
                        </button>
                      </div>

                      {isOpen && (
                        <div
                          id={detailsId}
                          className="mt-4 space-y-6 rounded-xl border border-white/10 bg-white/5 p-4 sm:p-6"
                        >
                          {special ? (
                            <SpecialStatusBanner
                              type={special}
                              messages={messages}
                            />
                          ) : (
                            <FulfillmentProgress
                              order={order}
                              messages={messages}
                            />
                          )}

                          <div className="min-w-0">
                            <h4 className="mb-3 text-xs text-gray-400">
                              {messages.productHeader}
                            </h4>

                            <ul className="space-y-4">
                              {order.products.map((product) => {
                                const productUrl = product.handle
                                  ? `/${lang}/product/${product.handle}`
                                  : product.href || null;

                                return (
                                  <li
                                    key={product.id}
                                    className="flex items-start gap-3"
                                  >
                                    <span className="mt-3 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white" />

                                    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div className="min-w-0">
                                        <h5 className="wrap-break-word text-base font-medium text-white sm:text-lg">
                                          {product.name}
                                        </h5>
                                      </div>

                                      <div className="mt-1 text-xs text-gray-400 sm:mt-2 sm:text-right">
                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-end sm:gap-5">
                                          <div>
                                            {messages.priceHeader}:{" "}
                                            <span className="pl-1 text-white">
                                              {product.price}
                                            </span>
                                          </div>

                                          {product.quantity != null && (
                                            <div>
                                              {messages.quantity}:{" "}
                                              <span className="pl-1 text-white">
                                                {product.quantity}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="mt-3">
                                          {productUrl && (
                                            <Link
                                              href={productUrl}
                                              className="border-b border-gray-400 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-300"
                                            >
                                              {messages.viewProduct}
                                            </Link>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center">
                <span className="text-sm text-gray-400">
                  {total > 0
                    ? `${messages.showing} ${(page - 1) * limit + 1}-${(page - 1) * limit + paginatedOrders.length} ${messages.of} ${total}`
                    : ""}
                </span>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                    onClick={() => goToPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    {messages.prev}
                  </button>

                  <button
                    type="button"
                    className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                    onClick={() => goToPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    {messages.next}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
