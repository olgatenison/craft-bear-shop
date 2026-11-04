import WholesaleContent, {
  type WholesaleProduct,
  type WholesaleUnit,
  type KegMaterial,
} from "@/app/components/WholesaleContent";

import ScrollToTopButton from "@/app/components/ui/ScrollToTopButton";
import { fetchAllProductsFlattened } from "@/app/data/repo";
import { getMessages } from "../messages";

import type { Locale } from "@/app/lib/locale";
import { LOCALES } from "@/app/lib/locale";

function normalizeLocale(raw: string): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}

function isWholesaleUnit(value: string | undefined): value is WholesaleUnit {
  return (
    value === "bottle" ||
    value === "can" ||
    value === "box" ||
    value === "liter" ||
    value === "keg"
  );
}

function isKegMaterial(value: string | undefined): value is KegMaterial {
  return value === "plastic" || value === "metal";
}

function parsePositiveNumber(value: string | undefined): number | undefined {
  if (!value || !value.trim()) return undefined;

  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function parsePositiveInteger(value: string | undefined): number | undefined {
  const number = parsePositiveNumber(value);

  return number !== undefined && Number.isSafeInteger(number)
    ? number
    : undefined;
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

      return parsePositiveNumber(price) !== undefined;
    })
    .map((product) => {
      const specs = product.specs;

      const wholesaleUnit = specs?.wholesale_unit;
      const kegMaterial = specs?.keg_material;

      return {
        id: product.id,
        title: product.title,
        handle: product.handle,

        wholesalePrice: specs?.wholesale_price ?? "0",

        currencyCode: product.priceRange.minVariantPrice.currencyCode,

        wholesaleUnit: isWholesaleUnit(wholesaleUnit)
          ? wholesaleUnit
          : undefined,

        quantityPerBox: parsePositiveInteger(specs?.wholesale_quantity_per_box),

        kegVolumeLiters: parsePositiveNumber(specs?.keg_volume_liters),

        kegMaterial: isKegMaterial(kegMaterial) ? kegMaterial : undefined,
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
        table={t.WholesalePage.table}
      />

      <ScrollToTopButton />
    </main>
  );
}
