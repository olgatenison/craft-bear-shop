// app/components/OrdersList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

// ─── Типы ─────────────────────────────────────────────────────────────────────

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

  paymentStatus?: string;
  fulfillmentStatus?: string;
  shippingAddress?: string;
  trackingNumber?: string;

  paid?: string;
  pending?: string;
  refunded?: string;
  partiallyRefunded?: string;
  authorized?: string;
  unpaid?: string;
  voided?: string;
  partiallyPaid?: string;

  unfulfilled?: string;
  fulfilled?: string;
  partial?: string;
  inProgress?: string;
  onHold?: string;
  scheduled?: string;

  stepPlaced?: string;
  stepPaid?: string;
  stepProcessing?: string;
  stepShipped?: string;
  stepDelivered?: string;

  statusCancelled?: string;
  statusRefunded?: string;
  statusPartiallyRefunded?: string;
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

// ─── Логика шагов ─────────────────────────────────────────────────────────────

function getNormalStep(order: OrderForUi): number {
  const pay = (order.financialStatus ?? "").toLowerCase();
  const ful = (order.fulfillmentStatus ?? "").toLowerCase();

  if (ful === "fulfilled") return 4;
  if (order.tracking?.number) return 3;
  if (["partial", "in_progress", "on_hold", "scheduled"].includes(ful))
    return 2;
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

// ─── Прогресс-бар ─────────────────────────────────────────────────────────────
//
// Структура (5 шагов, 4 сегмента между ними):
//
//  [dot]───────────[dot]───────────[dot]───────────[dot]───────────[dot]
//   0                1               2               3               4
//
// Рендерим это как чередование: dot | segment | dot | segment | ... | dot
// Каждый сегмент — flex-1, каждая точка — фиксированного размера.
// Закрашиваем сегмент жёлтым если он МЕЖДУ двумя активными точками.
//
// Это гарантирует что линия всегда точно соединяет точки — никакой математики.

function FulfillmentProgress({
  order,
  messages,
}: {
  order: OrderForUi;
  messages: AccountOrdersMessages;
}) {
  const currentStep = getNormalStep(order);

  const steps = [
    messages.stepPlaced ?? "Order placed",
    messages.stepPaid ?? "Paid",
    messages.stepProcessing ?? "Processing",
    messages.stepShipped ?? "Shipped",
    messages.stepDelivered ?? "Delivered",
  ];

  return (
    <div className="mb-8">
      {/* Верхняя строка: точки + линии между ними */}
      <div className="flex items-center">
        {steps.map((_, i) => {
          const isActive = i <= currentStep;
          const isCurrent = i === currentStep;
          // Сегмент после точки (кроме последней)
          const segmentActive = i < currentStep;

          return (
            <div
              key={i}
              className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}
            >
              {/* Точка */}
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

              {/* Сегмент линии после точки (не рисуем после последней) */}
              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 transition-all duration-500"
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

      {/* Нижняя строка: подписи под точками */}
      <div className="flex mt-2">
        {steps.map((label, i) => {
          const isActive = i <= currentStep;

          return (
            <div
              key={i}
              className={[
                i < steps.length - 1 ? "flex-1" : "",
                "flex",
                i === 0 ? "justify-start" : "",
                i === steps.length - 1 ? "justify-end" : "justify-center",
              ].join(" ")}
            >
              <span
                className={[
                  "text-[10px] leading-tight whitespace-nowrap",
                  isActive ? "text-yellow-400 font-semibold" : "text-gray-600",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Специальный статус ───────────────────────────────────────────────────────

function SpecialStatusBanner({
  type,
  messages,
}: {
  type: Exclude<SpecialStatus, null>;
  messages: AccountOrdersMessages;
}) {
  const config = {
    cancelled: {
      label: messages.statusCancelled ?? "Cancelled",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      dot: "bg-red-400",
    },
    refunded: {
      label: messages.statusRefunded ?? "Refunded",
      bg: "bg-gray-500/10",
      border: "border-gray-500/30",
      text: "text-gray-400",
      dot: "bg-gray-400",
    },
    partially_refunded: {
      label: messages.statusPartiallyRefunded ?? "Partially refunded",
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

// ─── Статус словом для шапки ──────────────────────────────────────────────────

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
        label: messages.statusCancelled ?? "Cancelled",
        className: "text-red-400",
      },
      refunded: {
        label: messages.statusRefunded ?? "Refunded",
        className: "text-gray-400",
      },
      partially_refunded: {
        label: messages.statusPartiallyRefunded ?? "Partially refunded",
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
    messages.stepPlaced ?? "Order placed",
    messages.stepPaid ?? "Paid",
    messages.stepProcessing ?? "Processing",
    messages.stepShipped ?? "Shipped",
    messages.stepDelivered ?? "Delivered",
  ];
  const colors = [
    "text-gray-400",
    "text-blue-400",
    "text-blue-400",
    "text-blue-400",
    "text-green-400",
  ];

  return (
    <span className={`text-xs font-medium ${colors[step]}`}>
      {labels[step]}
    </span>
  );
}

// ─── Бейджи ───────────────────────────────────────────────────────────────────

function badgeClass(bg: string, color: string) {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bg} ${color}`;
}

function getPaymentStatusBadge(
  status: string | undefined,
  messages: AccountOrdersMessages,
) {
  if (!status) return null;
  const s = status.toLowerCase();
  const map: Record<string, { label: string; color: string; bg: string }> = {
    paid: {
      label: messages.paid ?? "Paid",
      color: "text-green-700",
      bg: "bg-green-100",
    },
    pending: {
      label: messages.pending ?? "Pending",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    authorized: {
      label: messages.authorized ?? "Authorized",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    unpaid: {
      label: messages.unpaid ?? "Unpaid",
      color: "text-red-700",
      bg: "bg-red-100",
    },
    partially_paid: {
      label: messages.partiallyPaid ?? "Partially paid",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    refunded: {
      label: messages.refunded ?? "Refunded",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
    partially_refunded: {
      label: messages.partiallyRefunded ?? "Partially refunded",
      color: "text-orange-700",
      bg: "bg-orange-100",
    },
    voided: {
      label: messages.voided ?? "Voided",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
  };
  const cfg = map[s] ?? { label: s, color: "text-gray-700", bg: "bg-gray-100" };
  return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
}

function getFulfillmentStatusBadge(
  status: string | null | undefined,
  messages: AccountOrdersMessages,
) {
  const s = (status ?? "unfulfilled").toLowerCase();
  const map: Record<string, { label: string; color: string; bg: string }> = {
    unfulfilled: {
      label: messages.unfulfilled ?? "Unfulfilled",
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    fulfilled: {
      label: messages.fulfilled ?? "Fulfilled",
      color: "text-green-700",
      bg: "bg-green-100",
    },
    partial: {
      label: messages.partial ?? "Partially fulfilled",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    in_progress: {
      label: messages.inProgress ?? "In progress",
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    on_hold: {
      label: messages.onHold ?? "On hold",
      color: "text-orange-700",
      bg: "bg-orange-100",
    },
    scheduled: {
      label: messages.scheduled ?? "Scheduled",
      color: "text-gray-700",
      bg: "bg-gray-100",
    },
  };
  const cfg = map[s] ?? { label: s, color: "text-gray-700", bg: "bg-gray-100" };
  return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function OrdersList({
  messages,
  lang,
  orders,
}: OrdersListProps) {
  const [openOrderNumber, setOpenOrderNumber] = useState<string | null>(null);
  const toggleOrder = (n: string) =>
    setOpenOrderNumber((cur) => (cur === n ? null : n));
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
                const special = getSpecialStatus(order);

                return (
                  <div key={order.number}>
                    <h3 className="sr-only">
                      {messages.orderPlacedOnSrOnly}{" "}
                      <time dateTime={order.datetime}>{order.date}</time>
                    </h3>

                    {/* ШАПКА */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,2fr)_220px] lg:items-start border-b border-gray-700/70 pb-6">
                      <div className="text-xs">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-600">
                            {messages.datePlaced}
                          </div>
                          <div className="text-white">
                            <time dateTime={order.datetime}>{order.date}</time>
                          </div>
                        </div>
                        <div className="mt-6 space-y-1">
                          <div className="text-gray-600">
                            {messages.orderNumber}
                          </div>
                          <div className="text-gray-600">{order.number}</div>
                        </div>
                      </div>

                      <div className="space-y-3 w-full lg:justify-self-stretch md:pl-10">
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
                          <div className="space-y-1">
                            <div className="text-xs text-gray-600">
                              {messages.trackingNumber ?? "Tracking"}:
                            </div>
                            {order.tracking.url ? (
                              <a
                                href={order.tracking.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-300"
                              >
                                {order.tracking.number}
                              </a>
                            ) : (
                              <span className="text-xs text-gray-300">
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
                        className="flex w-full items-center justify-center rounded-md border border-gray-500/70 px-4 text-xs text-gray-300 hover:bg-white/10 hover:text-white h-9 whitespace-nowrap leading-none"
                      >
                        {isOpen ? messages.hideDetails : messages.viewDetails}
                      </button>
                    </div>

                    {/* ДЕТАЛИ */}
                    {isOpen && (
                      <div
                        id={detailsId}
                        className="mt-4 space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
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

                        {/* Товары */}
                        <div className="min-w-0">
                          <h4 className="mb-3 text-xs text-gray-600">
                            {messages.productHeader ?? "Products"}
                          </h4>
                          <ul className="space-y-3">
                            {order.products.map((product) => (
                              <li
                                key={product.id}
                                className="flex items-start gap-4"
                              >
                                <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
                                <div className="flex flex-row justify-between w-full">
                                  <h5 className="text-lg font-medium text-white">
                                    {product.name}
                                  </h5>
                                  <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                                    <div className="text-xs text-gray-600">
                                      <div>
                                        {messages.priceHeader ?? "Price"}:{" "}
                                        <span className="text-gray-400">
                                          {product.price}
                                        </span>
                                      </div>
                                      {product.quantity != null && (
                                        <div>
                                          Quantity:{" "}
                                          <span className="text-gray-400">
                                            {product.quantity}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <a
                                      href={product.href}
                                      className="text-xs text-gray-600 transition-colors hover:text-gray-300 border-b border-gray-600/70 hover:border-gray-300"
                                    >
                                      {messages.viewProduct}
                                    </a>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {order.financialStatus && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {messages.paymentStatus ?? "Payment"}:
                            </span>
                            {getPaymentStatusBadge(
                              order.financialStatus,
                              messages,
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {messages.fulfillmentStatus ?? "Fulfillment"}:
                          </span>
                          {getFulfillmentStatusBadge(
                            order.fulfillmentStatus,
                            messages,
                          )}
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

// // app/components/OrdersList.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import type { Locale } from "@/app/lib/locale";

// export type AccountOrdersMessages = {
//   title: string;
//   intro: string;
//   recentOrdersSrOnly: string;
//   orderPlacedOnSrOnly: string;
//   datePlaced: string;
//   orderNumber: string;
//   totalAmount: string;
//   hideDetails: string;
//   viewDetails: string;
//   productsSrOnly: string;
//   productHeader: string;
//   priceHeader: string;
//   statusHeader: string;
//   infoHeader: string;
//   viewProduct: string;
//   emptyTitle: string;
//   emptyDescription: string;
//   emptyCta: string;

//   // Labels
//   paymentStatus?: string;
//   fulfillmentStatus?: string;
//   shippingAddress?: string;
//   trackingNumber?: string;

//   // Payment translations
//   paid?: string;
//   pending?: string;
//   refunded?: string;
//   partiallyRefunded?: string;
//   authorized?: string;
//   unpaid?: string;
//   voided?: string;
//   partiallyPaid?: string;

//   // Fulfillment translations
//   unfulfilled?: string;
//   fulfilled?: string;
//   partial?: string;
//   inProgress?: string;
//   onHold?: string;
//   scheduled?: string;
// };

// export type OrderProduct = {
//   id: string;
//   name: string;
//   href: string;
//   price: string;
//   status: string;
//   quantity?: number;
// };

// export type OrderForUi = {
//   shopifyOrderId?: number;
//   number: string; // "#1004"
//   date: string;
//   datetime: string;
//   total: string;
//   financialStatus?: string; // lower-case
//   fulfillmentStatus?: string | null; // null -> unfulfilled
//   shippingAddress?: {
//     name: string;
//     address1: string;
//     city: string;
//     country: string;
//     zip: string;
//   };
//   tracking?: {
//     number: string;
//     url: string;
//   };
//   products: OrderProduct[];
// };

// type OrdersListProps = {
//   messages: AccountOrdersMessages;
//   lang: Locale;
//   orders: OrderForUi[];
// };

// function badgeClass(bgColor: string, color: string) {
//   return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${color}`;
// }

// // Payment badge (Shopify financial_status)
// function getPaymentStatusBadge(
//   status: string | undefined,
//   messages: AccountOrdersMessages,
// ) {
//   if (!status) return null;

//   const s = status.toLowerCase();

//   const statusConfig: Record<
//     string,
//     { label: string; color: string; bg: string }
//   > = {
//     paid: {
//       label: messages.paid || "Paid",
//       color: "text-green-700",
//       bg: "bg-green-100",
//     },
//     pending: {
//       label: messages.pending || "Pending",
//       color: "text-yellow-700",
//       bg: "bg-yellow-100",
//     },
//     authorized: {
//       label: messages.authorized || "Authorized",
//       color: "text-blue-700",
//       bg: "bg-blue-100",
//     },
//     unpaid: {
//       label: messages.unpaid || "Unpaid",
//       color: "text-red-700",
//       bg: "bg-red-100",
//     },
//     partially_paid: {
//       label: messages.partiallyPaid || "Partially paid",
//       color: "text-blue-700",
//       bg: "bg-blue-100",
//     },
//     refunded: {
//       label: messages.refunded || "Refunded",
//       color: "text-gray-700",
//       bg: "bg-gray-100",
//     },
//     partially_refunded: {
//       label: messages.partiallyRefunded || "Partially refunded",
//       color: "text-orange-700",
//       bg: "bg-orange-100",
//     },
//     voided: {
//       label: messages.voided || "Voided",
//       color: "text-gray-700",
//       bg: "bg-gray-100",
//     },
//   };

//   const cfg = statusConfig[s] || {
//     label: s,
//     color: "text-gray-700",
//     bg: "bg-gray-100",
//   };

//   return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
// }

// // Fulfillment badge (Shopify fulfillment_status) — Shopify null => Unfulfilled
// function getFulfillmentStatusBadge(
//   status: string | null | undefined,
//   messages: AccountOrdersMessages,
// ) {
//   const s = (status ?? "unfulfilled").toLowerCase();

//   const statusConfig: Record<
//     string,
//     { label: string; color: string; bg: string }
//   > = {
//     unfulfilled: {
//       label: messages.unfulfilled || "Unfulfilled",
//       color: "text-yellow-700",
//       bg: "bg-yellow-100",
//     },
//     fulfilled: {
//       label: messages.fulfilled || "Fulfilled",
//       color: "text-green-700",
//       bg: "bg-green-100",
//     },
//     partial: {
//       label: messages.partial || "Partially fulfilled",
//       color: "text-blue-700",
//       bg: "bg-blue-100",
//     },
//     in_progress: {
//       label: messages.inProgress || "In progress",
//       color: "text-blue-700",
//       bg: "bg-blue-100",
//     },
//     on_hold: {
//       label: messages.onHold || "On hold",
//       color: "text-orange-700",
//       bg: "bg-orange-100",
//     },
//     scheduled: {
//       label: messages.scheduled || "Scheduled",
//       color: "text-gray-700",
//       bg: "bg-gray-100",
//     },
//   };

//   const cfg = statusConfig[s] || {
//     label: s,
//     color: "text-gray-700",
//     bg: "bg-gray-100",
//   };

//   return <span className={badgeClass(cfg.bg, cfg.color)}>{cfg.label}</span>;
// }

// export default function OrdersList({
//   messages,
//   lang,
//   orders,
// }: OrdersListProps) {
//   const [openOrderNumber, setOpenOrderNumber] = useState<string | null>(null);

//   const toggleOrder = (number: string) => {
//     setOpenOrderNumber((current) => (current === number ? null : number));
//   };

//   const hasOrders = orders.length > 0;

//   return (
//     <main className="mt-10 space-y-6 lg:col-span-8 lg:mt-0">
//       <div>
//         <div className="mb-8 flex items-center justify-between gap-4">
//           <div>
//             <h1 className="text-xl font-semibold text-white">
//               {messages.title}
//             </h1>
//             <p className="mt-4 text-base text-gray-400">{messages.intro}</p>
//           </div>
//         </div>

//         <div className="mt-10">
//           <h2 className="sr-only">{messages.recentOrdersSrOnly}</h2>

//           {!hasOrders ? (
//             <div className="py-16">
//               <p className="text-lg text-gray-400">{messages.emptyTitle}</p>
//               <p className="my-2 text-gray-500">{messages.emptyDescription}</p>
//               <Link
//                 href={`/${lang}/shop`}
//                 className="relative mt-10 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
//               >
//                 {messages.emptyCta}
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-6">
//               {orders.map((order) => {
//                 const isOpen = openOrderNumber === order.number;
//                 const detailsId = `order-${order.number}-details`;

//                 return (
//                   <div key={order.number}>
//                     <h3 className="sr-only">
//                       {messages.orderPlacedOnSrOnly}{" "}
//                       <time dateTime={order.datetime}>{order.date}</time>
//                     </h3>

//                     {/* Order header */}
//                     <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,2fr)_220px] lg:items-start border-b border-gray-700/70 pb-6">
//                       {/* COL 1 */}
//                       <div className="text-xs">
//                         <div className="space-y-1">
//                           <div className="font-medium text-gray-600">
//                             {messages.datePlaced}
//                           </div>
//                           <div className="text-white">
//                             <time dateTime={order.datetime}>{order.date}</time>
//                           </div>
//                         </div>

//                         <div className="mt-6 space-y-1">
//                           <div className="text-gray-600">
//                             {messages.orderNumber}
//                           </div>
//                           <div className="text-gray-600">{order.number}</div>
//                         </div>
//                       </div>
//                       {/* COL 3 */}
//                       <div className="space-y-4 w-full lg:justify-self-stretch md:pl-10">
//                         <div className="space-y-1">
//                           <div className="text-xs font-medium text-gray-400">
//                             {messages.totalAmount}
//                           </div>
//                           <div className="text-base font-semibold text-yellow-400">
//                             {order.total}
//                           </div>
//                         </div>
//                         {order.tracking?.number && (
//                           <div className="space-y-1">
//                             <div className="text-xs text-gray-600">
//                               {messages.trackingNumber || "Tracking"}:
//                             </div>
//                             {order.tracking.url ? (
//                               <a
//                                 href={order.tracking.url}
//                                 target="_blank"
//                                 rel="noopener noreferrer"
//                                 className=" text-gray-300"
//                               >
//                                 {order.tracking.number}
//                               </a>
//                             ) : (
//                               <span className="text-xs text-gray-300">
//                                 {order.tracking.number}
//                               </span>
//                             )}
//                           </div>
//                         )}
//                       </div>{" "}
//                       <button
//                         type="button"
//                         onClick={() => toggleOrder(order.number)}
//                         aria-expanded={isOpen}
//                         aria-controls={detailsId}
//                         className="flex w-full items-center justify-center rounded-md border border-gray-500/70 px-4 text-xs text-gray-300 hover:bg-white/10 hover:text-white h-9 whitespace-nowrap leading-none"
//                       >
//                         {isOpen ? messages.hideDetails : messages.viewDetails}
//                       </button>
//                     </div>

//                     {/* Details */}
//                     {isOpen && (
//                       <div
//                         id={detailsId}
//                         className="mt-4 space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
//                       >
//                         {/* Products list */}
//                         <div className="min-w-0">
//                           <h4 className="mb-3 text-xs text-gray-600">
//                             {messages.productHeader || "Products"}
//                           </h4>

//                           <ul className="space-y-3">
//                             {order.products.map((product) => (
//                               <li
//                                 key={product.id}
//                                 className=" flex items-start gap-4"
//                               >
//                                 <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-white/70" />

//                                 <div className="flex flex-row justify-between w-full">
//                                   <h5 className="text-lg font-medium text-white">
//                                     {product.name}
//                                   </h5>

//                                   <div className="mt-2 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
//                                     <div className="text-xs text-gray-600">
//                                       <div>
//                                         {messages.priceHeader || "Price"}:{" "}
//                                         <span className="text-gray-400">
//                                           {product.price}
//                                         </span>
//                                       </div>
//                                       {product.quantity != null && (
//                                         <div>
//                                           Quantity:{" "}
//                                           <span className="text-gray-400">
//                                             {product.quantity}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </div>

//                                     <a
//                                       href={product.href}
//                                       className="text-xs text-gray-600 transition-colors hover:text-gray-300 border-b border-gray-600/70 hover:border-gray-300"
//                                     >
//                                       {messages.viewProduct}
//                                     </a>
//                                   </div>
//                                 </div>
//                               </li>
//                             ))}
//                           </ul>
//                         </div>

//                         {/* Payment */}
//                         {order.financialStatus && (
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs text-gray-400">
//                               {messages.paymentStatus || "Payment"}:
//                             </span>
//                             {getPaymentStatusBadge(
//                               order.financialStatus,
//                               messages,
//                             )}
//                           </div>
//                         )}

//                         {/* Fulfillment */}
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs text-gray-400">
//                             {messages.fulfillmentStatus || "Fulfillment"}:
//                           </span>
//                           {getFulfillmentStatusBadge(
//                             order.fulfillmentStatus,
//                             messages,
//                           )}
//                         </div>

//                         {/* <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
//                           <h4 className="sr-only">Status</h4>
//                           <p className="text-sm font-medium text-gray-900">
//                             {product.status} on{" "}
//                             <time dateTime={product.datetime}>
//                               {product.date}
//                             </time>
//                           </p>
//                           <div aria-hidden="true" className="mt-6">
//                             <div className="overflow-hidden rounded-full bg-gray-200">
//                               <div
//                                 style={{
//                                   width: `calc((${product.step} * 2 + 1) / 8 * 100%)`,
//                                 }}
//                                 className="h-2 rounded-full bg-indigo-600"
//                               />
//                             </div>
//                             <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
//                               <div className="text-indigo-600">
//                                 Order placed
//                               </div>
//                               <div
//                                 className={classNames(
//                                   product.step > 0 ? "text-indigo-600" : "",
//                                   "text-center",
//                                 )}
//                               >
//                                 Processing
//                               </div>
//                               <div
//                                 className={classNames(
//                                   product.step > 1 ? "text-indigo-600" : "",
//                                   "text-center",
//                                 )}
//                               >
//                                 Shipped
//                               </div>
//                               <div
//                                 className={classNames(
//                                   product.step > 2 ? "text-indigo-600" : "",
//                                   "text-right",
//                                 )}
//                               >
//                                 Delivered
//                               </div>
//                             </div>
//                           </div>
//                         </div> */}
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
