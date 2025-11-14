// app/[locale]/privacy-policy/page.tsx
import { fetchPageByHandle } from "@/app/data/repo";
import { notFound } from "next/navigation";
import type { Locale } from "@/app/lib/locale";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const page = await fetchPageByHandle("privacy-policy", lang);

  if (!page) {
    notFound();
  }

  return (
    <main className="max-w-5xl mx-auto py-20">
      <h1 className="text-3xl font-bold mb-6 ">{page.title}</h1>
      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </main>
  );
}
