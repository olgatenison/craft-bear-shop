// "use client";

// import { SignedIn, SignedOut, useUser, SignOutButton } from "@clerk/nextjs";
// import type { Locale } from "@/app/lib/locale";
// import LoginRegisterForm from "./LoginRegisterForm";

// export default function AccountContent({ lang }: { lang: Locale }) {
//   const { user } = useUser();

//   return (
//     <>
//       <SignedOut>
//         <LoginRegisterForm lang={lang} />
//       </SignedOut>

//       <SignedIn>
//         <div className="mt-6 space-y-6">
//           <section className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-4">
//             <div>
//               <h2 className="text-lg font-semibold text-white">Profile</h2>
//               <p className="mt-2 text-sm text-gray-300">
//                 {user?.fullName || user?.primaryEmailAddress?.emailAddress}
//               </p>
//               <p className="text-sm text-gray-400">
//                 {user?.primaryEmailAddress?.emailAddress}
//               </p>
//             </div>
//           </section>

//           <section className="rounded-lg border border-white/10 bg-white/5 p-4">
//             <h2 className="text-lg font-semibold text-white">Orders</h2>
//             <p className="mt-2 text-sm text-gray-400">
//               Later we’ll show Shopify orders here.
//             </p>
//           </section>

//           <div className="pt-2">
//             <SignOutButton redirectUrl={`/${lang}/account`}>
//               <button className="text-sm text-gray-400 hover:text-yellow-400">
//                 Log out
//               </button>
//             </SignOutButton>
//           </div>
//         </div>
//       </SignedIn>
//     </>
//   );
// }

"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { Locale } from "@/app/lib/locale";
import { useState } from "react";
import LoginRegisterForm from "./LoginRegisterForm"; // ⬅️ вернуть импорт

export default function AccountContent({ lang }: { lang: Locale }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.push(`/${lang}/account`);
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  // ❗ Незалогинен — показываем нашу форму
  if (!user) {
    return <LoginRegisterForm lang={lang} />;
  }

  // ✅ Залогинен — личный кабинет
  return (
    <div className="space-y-6">
      {/* Информация о пользователе */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">
          Profile Information
        </h2>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-400">Email</p>
            <p className="text-base text-white">
              {user.primaryEmailAddress?.emailAddress || "No email"}
            </p>
          </div>

          {(user.firstName || user.lastName) && (
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-base text-white">
                {user.firstName} {user.lastName || ""}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-400">Account created</p>
            <p className="text-base text-white">
              {new Date(user.createdAt!).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Заказы — позже подцепим Shopify */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Orders</h2>
        <p className="text-gray-400">
          Your orders will appear here once you make a purchase.
        </p>
      </div>

      {/* Действия */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => router.push(`/${lang}/orders`)}
          className="flex-1 px-6 py-3 rounded-md border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          View All Orders
        </button>

        <button
          onClick={handleSignOut}
          disabled={loading}
          className="flex-1 px-6 py-3 rounded-md border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
