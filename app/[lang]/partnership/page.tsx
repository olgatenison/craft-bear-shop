// app/[lang]/contact/page.tsx
import type { Locale } from "@/app/lib/locale";
import ContactContent from "@/app/components/ContactContent";
import { getMessages } from "@/app/[lang]/messages";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  return <ContactContent lang={lang} messages={messages} />;
}
