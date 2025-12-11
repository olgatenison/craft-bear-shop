// app/components/AccountReviewContent.tsx
"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useParams } from "next/navigation";

import type { Locale } from "@/app/lib/locale";
import { AccountSidebar } from "../components/ui/AccountSidebar";
import ReviewList from "./ui/ReviewList";

type AccountPageMessages = {
  signingOut: string;
  signOut: string;
  sidebarGreeting: string;
  tabProfile: string;
  tabOrders: string;
  tabReviews: string;
  tabAddresses: string;
};

type ReviewMessages = {
  title: string;
  empty: string;
  viewProduct: string;
  editReview: string;
};

type AccountReviewContentProps = {
  accountMessages: AccountPageMessages;
  reviewMessages: ReviewMessages;
};

export default function AccountReviewContent({
  accountMessages,
  reviewMessages,
}: AccountReviewContentProps) {
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
    try {
      setLoadingLogout(true);
      await signOut();
      window.location.href = `/${effectiveLang}`;
    } finally {
      setLoadingLogout(false);
    }
  };

  // 🔹 Пока Clerk ещё грузится — просто показываем заглушку
  if (!isLoaded) {
    return (
      <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
        <p className="text-sm text-gray-400 px-4">Loading account...</p>
      </section>
    );
  }

  // 🔹 Если по какой-то причине юзера нет — аккуратное сообщение
  if (!user) {
    return (
      <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl px-4">
        <p className="text-sm text-gray-400">
          You need to be signed in to view your reviews.
        </p>
      </section>
    );
  }

  // 🔹 Здесь мы уже точно знаем, что user НЕ null
  return (
    <section className="relative mx-auto my-10 max-w-7xl rounded-b-3xl">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
        <AccountSidebar
          user={user} // тут точно не null
          navItems={navItems}
          baseAccountPath={baseAccountPath}
          effectiveLang={effectiveLang}
          onSignOut={handleSignOut}
          signingOutLabel={accountMessages.signingOut}
          signOutLabel={accountMessages.signOut}
          greetingLabel={accountMessages.sidebarGreeting}
          loading={loadingLogout}
        />

        <ReviewList messages={reviewMessages} lang={effectiveLang} />
      </div>
    </section>
  );
}
