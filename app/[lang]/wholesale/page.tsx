// app/[lang]/wholesale/page.tsx

import WholesaleContent, {
  type WholesaleProduct,
} from "@/app/components/WholesaleContent";
import { getMessages } from "../messages";
import type { Locale } from "@/app/lib/locale";
import { LOCALES } from "@/app/lib/locale";

function normalizeLocale(raw: string): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}

export default async function WholesalePage({
  params,
}: {
  params: Promise<{
    lang: string;
  }>;
}) {
  const { lang: rawLang } = await params;

  const lang = normalizeLocale(rawLang);

  const t = await getMessages(lang);

  /*
   * Пока оставляем массив пустым.
   *
   * Следующим шагом подключим Shopify
   * и metafield wholesale_price.
   */
  const products: WholesaleProduct[] = [];

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <WholesaleContent
        lang={lang}
        products={products}
        title={t.WholesalePage.title}
        intro={t.WholesalePage.intro}
        productLabel={t.WholesalePage.productLabel}
        priceLabel={t.WholesalePage.priceLabel}
        viewProductLabel={t.WholesalePage.viewProduct}
        contactText={t.WholesalePage.contactText}
        contactLabel={t.WholesalePage.contactButton}
      />
    </main>
  );
}
