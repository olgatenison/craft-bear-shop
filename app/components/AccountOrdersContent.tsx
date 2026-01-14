// app/components/AccountOrdersContent.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/app/lib/locale";
import { AccountSidebar } from "../components/ui/AccountSidebar";
import OrdersList, {
  type AccountOrdersMessages,
  type OrderForUi,
} from "./ui/OrdersList";

type AccountPageMessages = {
  signingOut: string;
  signOut: string;
  sidebarGreeting: string;
  tabProfile: string;
  tabOrders: string;
  tabReviews: string;
  tabAddresses: string;
};

type AccountOrdersContentProps = {
  accountMessages: AccountPageMessages;
  ordersMessages: AccountOrdersMessages;
};

// Типы для заказов из Clerk
interface ClerkOrderItem {
  title: string;
  quantity: number;
  price: string;
  variantId: string | null;
  image: string | null;
}

interface ClerkOrder {
  shopifyOrderId: number;
  orderNumber: number;
  totalPrice: string;
  currency: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string | null;
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
  items: ClerkOrderItem[];
}

export default function AccountOrdersContent({
  accountMessages,
  ordersMessages,
}: AccountOrdersContentProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();

  const [loadingLogout, setLoadingLogout] = useState(false);
  const [orders, setOrders] = useState<OrderForUi[] | null>(null);
  const [syncing, setSyncing] = useState(false);

  const langFromParams = params?.lang;
  const lang = (
    Array.isArray(langFromParams) ? langFromParams[0] : langFromParams
  ) as Locale | undefined;
  const effectiveLang = (lang || "en") as Locale;

  const baseAccountPath = `/${effectiveLang}/account`;

  const navItems = [
    { href: baseAccountPath, label: accountMessages.tabProfile },
    { href: `${baseAccountPath}/orders`, label: accountMessages.tabOrders },
    { href: `${baseAccountPath}/reviews`, label: accountMessages.tabReviews },
    {
      href: `${baseAccountPath}/addresses`,
      label: accountMessages.tabAddresses,
    },
  ];

  // Функция синхронизации
  const syncOrders = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/shopify/sync-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.warn("Sync failed:", await res.text());
        return false;
      }

      const data = await res.json();
      console.log("Sync result:", data);
      return data.success && data.synced > 0;
    } catch (error) {
      console.warn("Sync error:", error);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Функция форматирования заказов для UI
  const formatOrdersForUI = (clerkOrders: ClerkOrder[]): OrderForUi[] => {
    return clerkOrders.map((order) => ({
      shopifyOrderId: order.shopifyOrderId,
      number: `${order.orderNumber}`,
      date: new Date(order.createdAt).toLocaleDateString(effectiveLang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      datetime: order.createdAt,
      total: `${order.totalPrice} ${order.currency}`,
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      shippingAddress: order.shippingAddress,
      tracking: order.tracking,
      products: order.items.map((item) => ({
        id: item.variantId || `${order.shopifyOrderId}-${item.title}`,
        name: item.title,
        href: item.variantId
          ? `/${effectiveLang}/product/${item.variantId}`
          : "#",
        price: `${item.price} ${order.currency}`,
        status: order.financialStatus,
        imageSrc: item.image || "/placeholder-product.jpg",
        imageAlt: item.title,
        quantity: item.quantity,
      })),
    }));
  };

  // Загрузка заказов
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadOrders = async () => {
      try {
        // Получаем заказы напрямую из metadata пользователя
        const clerkOrders = (user.publicMetadata?.orders as ClerkOrder[]) || [];

        // Если заказов нет - пробуем синхронизировать
        if (clerkOrders.length === 0 && !cancelled) {
          console.log("📦 No orders found, attempting auto-sync...");
          const synced = await syncOrders();

          if (synced) {
            // Перезагружаем пользователя после синхронизации
            await user.reload();
            const updatedOrders =
              (user.publicMetadata?.orders as ClerkOrder[]) || [];

            if (!cancelled) {
              setOrders(formatOrdersForUI(updatedOrders));
            }
            return;
          }
        }

        if (!cancelled) {
          setOrders(formatOrdersForUI(clerkOrders));
        }
      } catch (e) {
        console.warn("Orders load error", e);
        if (!cancelled) setOrders([]);
      }
    };

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    setLoadingLogout(true);
    try {
      await signOut({ redirectUrl: `/${effectiveLang}/account` });
    } catch (error) {
      console.error("Sign out error:", error);
      setLoadingLogout(false);
    }
  };

  if (!isLoaded) {
    return (
      <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400" />
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        <AccountSidebar
          user={user}
          navItems={navItems}
          baseAccountPath={baseAccountPath}
          effectiveLang={effectiveLang}
          onSignOut={handleSignOut}
          signingOutLabel={accountMessages.signingOut}
          signOutLabel={accountMessages.signOut}
          greetingLabel={accountMessages.sidebarGreeting}
          loading={loadingLogout}
        />

        <OrdersList
          messages={ordersMessages}
          lang={effectiveLang}
          orders={orders ?? []}
        />
      </div>
    </section>
  );
}

// // app/components/AccountOrdersContent.tsx
// "use client";

// import { useUser, useClerk } from "@clerk/nextjs";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import type { Locale } from "@/app/lib/locale";
// import { AccountSidebar } from "../components/ui/AccountSidebar";
// import OrdersList, {
//   type AccountOrdersMessages,
//   type OrderForUi,
// } from "./ui/OrdersList";

// type AccountPageMessages = {
//   signingOut: string;
//   signOut: string;
//   sidebarGreeting: string;
//   tabProfile: string;
//   tabOrders: string;
//   tabReviews: string;
//   tabAddresses: string;
// };

// type AccountOrdersContentProps = {
//   accountMessages: AccountPageMessages;
//   ordersMessages: AccountOrdersMessages;
// };

// export default function AccountOrdersContent({
//   accountMessages,
//   ordersMessages,
// }: AccountOrdersContentProps) {
//   const { user, isLoaded } = useUser();
//   const { signOut } = useClerk();
//   const params = useParams();

//   const [loadingLogout, setLoadingLogout] = useState(false);
//   const [orders, setOrders] = useState<OrderForUi[] | null>(null);
//   const [syncing, setSyncing] = useState(false);

//   const langFromParams = params?.lang;
//   const lang = (
//     Array.isArray(langFromParams) ? langFromParams[0] : langFromParams
//   ) as Locale | undefined;
//   const effectiveLang = (lang || "en") as Locale;

//   const baseAccountPath = `/${effectiveLang}/account`;

//   const navItems = [
//     { href: baseAccountPath, label: accountMessages.tabProfile },
//     { href: `${baseAccountPath}/orders`, label: accountMessages.tabOrders },
//     { href: `${baseAccountPath}/reviews`, label: accountMessages.tabReviews },
//     {
//       href: `${baseAccountPath}/addresses`,
//       label: accountMessages.tabAddresses,
//     },
//   ];

//   // Функция синхронизации
//   const syncOrders = async () => {
//     try {
//       setSyncing(true);
//       const res = await fetch("/api/shopify/sync-orders", {
//         method: "POST",
//       });

//       if (!res.ok) {
//         console.warn("Sync failed:", await res.text());
//         return false;
//       }

//       const data = await res.json();
//       console.log("Sync result:", data);
//       return data.success && data.synced > 0;
//     } catch (error) {
//       console.warn("Sync error:", error);
//       return false;
//     } finally {
//       setSyncing(false);
//     }
//   };

//   // Загрузка заказов
//   useEffect(() => {
//     if (!user) return;

//     let cancelled = false;

//     const loadOrders = async () => {
//       try {
//         // 1. Загружаем существующие заказы из Clerk
//         const res = await fetch("/api/account/orders", { cache: "no-store" });

//         if (res.status === 401) {
//           if (!cancelled) setOrders([]);
//           return;
//         }

//         const data = await res.json();

//         if (!res.ok) {
//           console.warn("Failed to load orders", data);
//           if (!cancelled) setOrders([]);
//           return;
//         }

//         const existingOrders = data.orders ?? [];

//         // 2. Если заказов нет - пробуем синхронизировать автоматически
//         if (existingOrders.length === 0 && !cancelled) {
//           console.log("📦 No orders found, attempting auto-sync...");
//           const synced = await syncOrders();

//           if (synced) {
//             // Перезагружаем заказы после синхронизации
//             const res2 = await fetch("/api/account/orders", {
//               cache: "no-store",
//             });
//             if (res2.ok) {
//               const data2 = await res2.json();
//               if (!cancelled) {
//                 setOrders(data2.orders ?? []);
//               }
//               return;
//             }
//           }
//         }

//         if (!cancelled) {
//           setOrders(existingOrders);
//         }
//       } catch (e) {
//         console.warn("Orders load error", e);
//         if (!cancelled) setOrders([]);
//       }
//     };

//     loadOrders();

//     return () => {
//       cancelled = true;
//     };
//   }, [user]);

//   const handleSignOut = async () => {
//     setLoadingLogout(true);
//     try {
//       await signOut({ redirectUrl: `/${effectiveLang}/account` });
//     } catch (error) {
//       console.error("Sign out error:", error);
//       setLoadingLogout(false);
//     }
//   };

//   if (!isLoaded) {
//     return (
//       <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
//         <div className="flex justify-center py-8">
//           <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-400" />
//         </div>
//       </section>
//     );
//   }

//   if (!user) return null;

//   return (
//     <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
//       <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
//         <AccountSidebar
//           user={user}
//           navItems={navItems}
//           baseAccountPath={baseAccountPath}
//           effectiveLang={effectiveLang}
//           onSignOut={handleSignOut}
//           signingOutLabel={accountMessages.signingOut}
//           signOutLabel={accountMessages.signOut}
//           greetingLabel={accountMessages.sidebarGreeting}
//           loading={loadingLogout}
//         />

//         <OrdersList
//           messages={ordersMessages}
//           lang={effectiveLang}
//           orders={orders ?? []}
//           loading={syncing}
//         />
//       </div>
//     </section>
//   );
// }
