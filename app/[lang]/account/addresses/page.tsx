// app/[lang]/account/addresses/page.tsx (SERVER component)
import { getMessages, Locale } from "../../messages";
import AccountAddressesContent from "@/app/components/AccountAddressesContent";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  const accountMessages = messages.AccountPage;
  const addressMessages = messages.AccountAddressesPage;

  return (
    <div className=" mx-auto my-10 max-w-7xl overflow-hidden px-6">
      <AccountAddressesContent
        accountMessages={accountMessages}
        addressMessages={addressMessages}
      />
    </div>
  );
}
