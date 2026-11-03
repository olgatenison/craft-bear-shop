// app/[lang]/wholesale/page.tsx

import WholesaleContent, {
  type WholesaleProduct,
} from "@/app/components/WholesaleContent";
import ScrollToTopButton from "@/app/components/ui/ScrollToTopButton";
import { fetchAllProductsFlattened } from "@/app/data/repo";
import { getMessages } from "../messages";

import type { Locale } from "@/app/lib/locale";
import { LOCALES } from "@/app/lib/locale";

function normalizeLocale(raw: string): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}

type WholesaleUnit = "bottle" | "can" | "box" | "liter" | "keg";

function isWholesaleUnit(value: string | undefined): value is WholesaleUnit {
  return (
    value === "bottle" ||
    value === "can" ||
    value === "box" ||
    value === "liter" ||
    value === "keg"
  );
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

  const allProducts = await fetchAllProductsFlattened(lang);

  const products: WholesaleProduct[] = allProducts
    .filter((product) => {
      const price = product.specs?.wholesale_price;

      return Boolean(
        price && !Number.isNaN(Number(price)) && Number(price) > 0,
      );
    })
    .map((product) => {
      const wholesalePrice = product.specs?.wholesale_price ?? "0";

      const wholesaleUnit = product.specs?.wholesale_unit;

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,
        wholesalePrice,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,

        wholesaleUnit: isWholesaleUnit(wholesaleUnit)
          ? wholesaleUnit
          : undefined,
      };
    });

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
        units={t.WholesalePage.units}
      />
      <ScrollToTopButton />
    </main>
  );
}
