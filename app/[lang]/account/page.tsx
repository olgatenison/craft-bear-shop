// app/[lang]/account/page.tsx
import { getMessages, Locale } from "../messages";
import AccountContent from "../../components/AccountContent";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <h1 className="mb-4 text-2xl font-semibold">
        {messages.AccountPage?.title ?? "My account"}
      </h1>
      <AccountContent lang={lang} />
    </div>
  );
}
