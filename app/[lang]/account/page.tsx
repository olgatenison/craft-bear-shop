// app/[lang]/account/page.tsx

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getMessages, Locale } from "../messages";
import AccountContent from "../../components/AccountContent";
import LoginRegisterForm from "../../components/LoginRegisterForm";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateShopifyCustomer } from "@/app/lib/shopify/getOrCreateShopifyCustomer";

export type AccountPageMessages = {
  title: string;
  profileInformation: string;
  email: string;
  name: string;
  accountCreated: string;
  recentOrders: string;
  recentOrdersDescription: string;
  viewAllOrders: string;
  signingOut: string;
  signOut: string;
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  // ✅ Додаємо await тут!
  const { userId } = await auth();

  let shopifyCustomerId: string | null = null;
  let shopifyError: string | null = null;

  if (userId) {
    try {
      console.log("🔷 Account page: Getting Shopify customer...");
      shopifyCustomerId = await getOrCreateShopifyCustomer();
      console.log("🔷 Account page: Result:", shopifyCustomerId);
    } catch (error) {
      console.error("🔷 Account page: Error:", error);
      shopifyError = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="mb-4 text-2xl font-semibold">
        {messages.AccountPage?.title ?? "My account"}
      </h1>

      <SignedIn>
        <AccountContent
          messages={messages.AccountPage}
          shopifyCustomerId={shopifyCustomerId}
          shopifyError={shopifyError}
        />
      </SignedIn>

      <SignedOut>
        <LoginRegisterForm messages={messages.auth} />
      </SignedOut>
    </div>
  );
}
