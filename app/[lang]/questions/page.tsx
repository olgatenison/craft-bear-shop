// // app/[lang]/contact/page.tsx
// import type { Locale } from "@/app/lib/locale";
// import FAQ from "@/app/components/ui/FAQ";
// import { getMessages } from "@/app/[lang]/messages";

// export default async function QuestionsPage({
//   params,
// }: {
//   params: Promise<{ lang: Locale }>;
// }) {
//   const { lang } = await params;
//   const messages = await getMessages(lang);

//   return <FAQ />;
// }

import type { Locale } from "@/app/lib/locale";
import FAQ from "@/app/components/ui/FAQ";
import { getMessages } from "@/app/[lang]/messages";
import { getFaq } from "./../../lib/shopify/getFaq";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  const messages = await getMessages(lang);
  const faqs = await getFaq(lang);

  return (
    <FAQ
      title={messages.Questions?.title ?? "FAQ"}
      emptyText={messages.Questions?.empty ?? ""}
      faqs={faqs}
    />
  );
}
