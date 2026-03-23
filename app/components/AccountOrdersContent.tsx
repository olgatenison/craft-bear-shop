// app/components/AccountOrdersContent.tsx"use client";
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

// interface ClerkOrderItem {
//   title: string;
//   quantity: number;
//   price: string;
//   variantId: string | null;
// }

// interface ClerkOrder {
//   shopifyOrderId: number;
//   orderNumber: number;
//   name?: string;
//   totalPrice: string;
//   currency: string;
//   createdAt: string;
//   financialStatus: string;
//   fulfillmentStatus: string | null;
//   tracking?: {
//     number: string;
//     url: string;
//   };
//   shippingAddress?: {
//     name: string;
//     address1: string;
//     city: string;
//     country: string;
//     zip: string;
//   };
//   items: ClerkOrderItem[];
// }

// function formatOrdersForUI(
//   clerkOrders: ClerkOrder[],
//   lang: Locale,
// ): OrderForUi[] {
//   return clerkOrders.map((order) => {
//     const financialStatus = (order.financialStatus || "").toLowerCase();
//     const fulfillmentStatus = (
//       order.fulfillmentStatus ?? "unfulfilled"
//     ).toLowerCase();

//     return {
//       shopifyOrderId: order.shopifyOrderId,
//       number: order.name || `#${order.orderNumber}`,
//       date: new Date(order.createdAt).toLocaleDateString(lang, {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       }),
//       datetime: order.createdAt,
//       total: `${order.totalPrice} ${order.currency}`,
//       financialStatus,
//       fulfillmentStatus,
//       shippingAddress: order.shippingAddress,
//       tracking: order.tracking,
//       products: order.items.map((item) => ({
//         id: item.variantId || `${order.shopifyOrderId}-${item.title}`,
//         name: item.title,
//         href: item.variantId ? `/${lang}/product/${item.variantId}` : "#",
//         price: `${item.price} ${order.currency}`,
//         status: financialStatus,
//         imageSrc: "/placeholder-product.jpg",
//         imageAlt: item.title,
//         quantity: item.quantity,
//       })),
//     };
//   });
// }

export default function AccountOrdersContent({
  accountMessages,
  ordersMessages,
}: AccountOrdersContentProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();

  const [loadingLogout, setLoadingLogout] = useState(false);
  const [orders, setOrders] = useState<OrderForUi[] | null>(null);

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

  const syncOrders = async () => {
    try {
      const res = await fetch("/api/shopify/sync-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.warn("Sync failed:", await res.text());
        return false;
      }

      const data = await res.json();
      console.log("Sync result:", data);

      return Boolean(data.success);
    } catch (error) {
      console.warn("Sync error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadOrders = async () => {
      try {
        // const cached = (user.publicMetadata?.orders as ClerkOrder[]) || [];
        // if (cached.length > 0 && !cancelled) {
        //   setOrders(formatOrdersForUI(cached, effectiveLang));
        // }

        await syncOrders();

        const res = await fetch(
          `/${effectiveLang}/api/account/orders?lang=${effectiveLang}`,
        );
        if (res.ok) {
          const { orders: freshOrders } = await res.json();
          if (!cancelled) {
            setOrders(freshOrders);
          }
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
  }, [user, effectiveLang]);

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
    <section className="relative mx-auto my-10 max-w-7xl ">
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
          key={effectiveLang}
          messages={ordersMessages}
          lang={effectiveLang}
          orders={orders ?? []}
        />
      </div>
    </section>
  );
}
