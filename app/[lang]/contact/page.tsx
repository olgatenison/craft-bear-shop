// app/[locale]/privacy-policy/page.tsx
import { fetchPageByHandle } from "@/app/data/repo";
import { notFound } from "next/navigation";
import type { Locale } from "@/app/lib/locale";
// import { LegalPageLayout } from "@/app/components/LegalPageLayout";
import ContactAdresses from "@/app/components/ui/ContactAdresses";

export default async function ContactPage({
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
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ContactAdresses />
      {/* <LegalPageLayout title={page.title} html={page.body} /> */}
    </main>
  );
}
