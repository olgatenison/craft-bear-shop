// app/components/AccountOrdersContent.tsx
"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/app/lib/locale";
import { AccountSidebar } from "../components/ui/AccountSidebar";
import OrdersList, {
  type AccountOrdersMessages,
} from "@/app/components/ui/OrdersList";

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

export default function AccountOrdersContent({
  accountMessages,
  ordersMessages,
}: AccountOrdersContentProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const params = useParams();

  const [loadingLogout, setLoadingLogout] = useState(false);

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

        <OrdersList messages={ordersMessages} lang={effectiveLang} />
      </div>
    </section>
  );
}
