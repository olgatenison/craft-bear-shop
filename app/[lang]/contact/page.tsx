// app/[locale]/privacy-policy/page.tsx
import { fetchPageByHandle } from "@/app/data/repo";
import { notFound } from "next/navigation";
import type { Locale } from "@/app/lib/locale";
import { LegalPageLayout } from "@/app/components/LegalPageLayout";

export default async function CookiesPolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const page = await fetchPageByHandle("contact", lang);

  if (!page) {
    notFound();
  }

  return (
    <main>
      <LegalPageLayout title={page.title} html={page.body} />
    </main>
  );
}

// // app/[lang]/contact/page.tsx
// import type { Locale } from "@/app/lib/locale";
// import ContactContent from "@/app/components/ContactContent";
// import { getMessages } from "@/app/[lang]/messages";

// export default async function ContactPage({
//   params,
// }: {
//   params: Promise<{ lang: Locale }>;
// }) {
//   const { lang } = await params;
//   const messages = await getMessages(lang);

//   return <ContactContent lang={lang} messages={messages} />;
// }
