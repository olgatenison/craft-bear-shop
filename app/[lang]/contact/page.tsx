import type { Locale } from "@/app/lib/locale";
import { getMessages } from "../messages";
import ContactAdresses from "@/app/components/ui/ContactAdresses";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = await getMessages(lang);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ContactAdresses lang={lang} translations={t.ContactPage} />
    </main>
  );
}
