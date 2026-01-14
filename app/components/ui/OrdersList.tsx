// app/components/OrdersList.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
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
  // Новые переводы
  paymentStatus?: string;
  deliveryStatus?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  paid?: string;
  pending?: string;
  refunded?: string;
  fulfilled?: string;
  notShipped?: string;
  partial?: string;
};

export type OrderProduct = {
  id: string;
  name: string;
  href: string;
  price: string;
  status: string;
  imageSrc: string;
  imageAlt: string;
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

// Функция для получения статуса оплаты
function getPaymentStatusBadge(
  status: string | undefined,
  messages: AccountOrdersMessages
) {
  if (!status) return null;

  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    paid: {
      label: messages.paid || "Paid",
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    pending: {
      label: messages.pending || "Pending",
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
    },
    refunded: {
      label: messages.refunded || "Refunded",
      color: "text-red-700",
      bgColor: "bg-red-100",
    },
    partially_refunded: {
      label: messages.refunded || "Partially Refunded",
      color: "text-orange-700",
      bgColor: "bg-orange-100",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// Функция для получения статуса доставки
function getFulfillmentStatusBadge(
  status: string | null | undefined,
  messages: AccountOrdersMessages
) {
  if (status === null || status === undefined) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
        {messages.notShipped || "Not Shipped"}
      </span>
    );
  }

  const statusConfig: Record<
    string,
    { label: string; color: string; bgColor: string }
  > = {
    fulfilled: {
      label: messages.fulfilled || "Delivered",
      color: "text-green-700",
      bgColor: "bg-green-100",
    },
    partial: {
      label: messages.partial || "Partially Shipped",
      color: "text-blue-700",
      bgColor: "bg-blue-100",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
    >
      {config.label}
    </span>
  );
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

                    {/* Header заказа */}
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-6 text-sm text-gray-200 sm:px-6">
                      <div className="sm:flex sm:items-start sm:justify-between sm:gap-6">
                        {/* Основная информация */}
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

                        {/* Статусы и кнопка */}
                        <div className="mt-6 space-y-4 sm:ml-6 sm:mt-0 sm:w-auto sm:flex-none">
                          {/* Статус оплаты */}
                          {order.financialStatus && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {messages.paymentStatus || "Payment"}:
                              </span>
                              {getPaymentStatusBadge(
                                order.financialStatus,
                                messages
                              )}
                            </div>
                          )}

                          {/* Статус доставки */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {messages.deliveryStatus || "Delivery"}:
                            </span>
                            {getFulfillmentStatusBadge(
                              order.fulfillmentStatus,
                              messages
                            )}
                          </div>

                          {/* Кнопка развернуть */}
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

                    {/* Детали заказа */}
                    {isOpen && (
                      <div
                        id={detailsId}
                        className="mt-4 space-y-6 rounded-xl border border-white/10 bg-white/5 p-6"
                      >
                        {/* Адрес доставки */}
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

                        {/* Трекинг */}
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

                        {/* Товары */}
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
                                {/* Картинка товара */}
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-700">
                                  <Image
                                    src={product.imageSrc}
                                    alt={product.imageAlt}
                                    fill
                                    sizes="80px"
                                    className="object-contain p-2"
                                  />
                                </div>

                                {/* Информация о товаре */}
                                <div className="flex-1 space-y-1">
                                  <h5 className="font-medium text-white">
                                    {product.name}
                                  </h5>
                                  <p className="text-sm text-gray-400">
                                    {messages.priceHeader || "Price"}:{" "}
                                    {product.price}
                                  </p>
                                  {product.quantity && (
                                    <p className="text-sm text-gray-400">
                                      Quantity: {product.quantity}
                                    </p>
                                  )}
                                </div>

                                {/* Ссылка на товар */}
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

// // app/components/OrdersList.tsx
// "use client";

// import { useState } from "react";
// import Image from "next/image";
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
// };

// export type OrderProduct = {
//   id: string;
//   name: string;
//   href: string;
//   price: string;
//   status: string;
//   imageSrc: string;
//   imageAlt: string;
// };

// export type OrderForUi = {
//   number: string;
//   date: string;
//   datetime: string;
//   total: string;
//   products: OrderProduct[];
// };

// type OrdersListProps = {
//   messages: AccountOrdersMessages;
//   lang: Locale;
//   orders: OrderForUi[];
// };

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
//               <p className="text-gray-400 text-lg">{messages.emptyTitle}</p>
//               <p className="text-gray-500 my-2">{messages.emptyDescription}</p>
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

//                     <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-6 text-sm text-gray-200 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:px-6">
//                       <dl className="flex-auto divide-y divide-gray-200 text-sm text-gray-600 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
//                         <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0">
//                           <dt className="font-medium text-gray-400">
//                             {messages.datePlaced}
//                           </dt>
//                           <dd className="sm:mt-1 text-white">
//                             <time dateTime={order.datetime}>{order.date}</time>
//                           </dd>
//                         </div>
//                         <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0">
//                           <dt className="font-medium text-gray-400">
//                             {messages.orderNumber}
//                           </dt>
//                           <dd className="sm:mt-1 text-white">{order.number}</dd>
//                         </div>
//                       </dl>

//                       <div className="flex gap-6 items-center">
//                         <div className="max-sm:flex max-sm:justify-between max-sm:py-6 max-sm:first:pt-0 max-sm:last:pb-0 text-right">
//                           <dt className="font-medium text-white">
//                             {messages.totalAmount}
//                           </dt>
//                           <dd className="font-medium text-yellow-400 sm:mt-1">
//                             {order.total}
//                           </dd>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => toggleOrder(order.number)}
//                           aria-expanded={isOpen}
//                           aria-controls={detailsId}
//                           className="mt-6 inline-flex shrink-0 items-center justify-center rounded-md border border-white/25 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 sm:ml-8 sm:mt-0 lg:ml-0 lg:w-auto"
//                         >
//                           {isOpen ? messages.hideDetails : messages.viewDetails}
//                         </button>
//                       </div>
//                     </div>

//                     {isOpen && (
//                       <table
//                         id={detailsId}
//                         className="mt-4 w-full text-gray-400 sm:mt-6"
//                       >
//                         <caption className="sr-only">
//                           {messages.productsSrOnly}
//                         </caption>
//                         <thead className="sr-only text-left text-sm text-gray-400 sm:not-sr-only">
//                           <tr>
//                             <th
//                               scope="col"
//                               className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3"
//                             >
//                               {messages.productHeader}
//                             </th>
//                             <th
//                               scope="col"
//                               className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell"
//                             >
//                               {messages.priceHeader}
//                             </th>
//                             <th
//                               scope="col"
//                               className="hidden py-3 pr-8 font-normal sm:table-cell"
//                             >
//                               {messages.statusHeader}
//                             </th>
//                             <th
//                               scope="col"
//                               className="w-0 py-3 text-right font-normal"
//                             >
//                               {messages.infoHeader}
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-500 border-b border-gray-500 text-sm sm:border-t">
//                           {order.products.map((product) => (
//                             <tr key={product.id}>
//                               <td className="py-6 pr-8">
//                                 <div className="flex items-center">
//                                   <div className="mr-6 relative size-16 rounded-lg bg-stone-600 overflow-hidden">
//                                     <Image
//                                       src={product.imageSrc}
//                                       alt={product.imageAlt}
//                                       fill
//                                       sizes="64px"
//                                       className="object-contain p-3"
//                                     />
//                                   </div>
//                                   <div>
//                                     <div className="font-medium text-white">
//                                       {product.name}
//                                     </div>
//                                     <div className="mt-1 sm:hidden">
//                                       {product.price}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                               <td className="hidden py-6 pr-8 sm:table-cell">
//                                 {product.price}
//                               </td>
//                               <td className="hidden py-6 pr-8 sm:table-cell">
//                                 {product.status}
//                               </td>
//                               <td className="whitespace-nowrap py-6 text-right font-medium">
//                                 <a
//                                   href={product.href}
//                                   className="text-yellow-400 hover:text-white focus:text-white transition-colors duration-200"
//                                 >
//                                   {messages.viewProduct}
//                                   <span className="sr-only">
//                                     , {product.name}
//                                   </span>
//                                 </a>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
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
