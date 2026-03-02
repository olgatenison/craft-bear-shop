// app/[lang]/account/orders/page.tsx
import { getMessages, type Locale } from "../../messages";
import AccountOrdersContent from "@/app/components/AccountOrdersContent";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  const accountMessages = messages.AccountPage;
  const ordersMessages = messages.AccountOrders;

  return (
    <div className=" mx-auto my-10 max-w-7xl overflow-hidden px-6">
      {" "}
      <AccountOrdersContent
        accountMessages={accountMessages}
        ordersMessages={ordersMessages}
      />
    </div>
  );
}
