// app/components/AccountContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/app/lib/locale";
import LoginRegisterForm from "./LoginRegisterForm";

type Customer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  defaultAddress: {
    address1: string | null;
    city: string | null;
    country: string | null;
    zip: string | null;
  } | null;
};

export default function AccountContent({ lang }: { lang: Locale }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (!cancelled) setCustomer(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) setCustomer(data.customer ?? null);
      } catch {
        if (!cancelled) setCustomer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-6 text-sm text-gray-400">Loading your account...</div>
    );
  }

  if (!customer) {
    // ❗ не залогинен → показываем твою форму
    return <LoginRegisterForm lang={lang} />;
  }

  // ✅ залогинен → показываем кабинет
  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <p className="mt-2 text-sm text-gray-300">
            {customer.firstName || customer.lastName
              ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim()
              : customer.email}
          </p>
          <p className="text-sm text-gray-400">{customer.email}</p>
          {customer.phone && (
            <p className="mt-1 text-sm text-gray-400">{customer.phone}</p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold text-white">Default address</h2>
        {customer.defaultAddress ? (
          <div className="mt-2 text-sm text-gray-300 space-y-1">
            <p>{customer.defaultAddress.address1}</p>
            <p>
              {customer.defaultAddress.city}{" "}
              {customer.defaultAddress.zip &&
                `, ${customer.defaultAddress.zip}`}
            </p>
            <p>{customer.defaultAddress.country}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No default address yet.</p>
        )}
      </section>

      <section className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold text-white">Orders</h2>
        <p className="mt-2 text-sm text-gray-400">
          Order history will be shown here (позже подтянем из Shopify).
        </p>
      </section>

      <div className="pt-2">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.refresh();
          }}
          className="text-sm text-gray-400 hover:text-yellow-400"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
