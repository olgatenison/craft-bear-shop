// app/components/WholesaleContent.tsx

import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

export type WholesaleUnit = "bottle" | "can" | "box" | "liter" | "keg";

export type WholesaleProduct = {
  id: string;
  title: string;
  handle: string;
  wholesalePrice: string;
  currencyCode: string;
  wholesaleUnit?: WholesaleUnit;
};

type WholesaleUnits = {
  bottle: string;
  can: string;
  box: string;
  liter: string;
  keg: string;
};

type WholesaleContentProps = {
  lang: Locale;
  products: WholesaleProduct[];

  title: string;
  intro: string;
  productLabel: string;
  priceLabel: string;
  viewProductLabel: string;
  contactText: string;
  contactLabel: string;

  units: WholesaleUnits;
};

export default function WholesaleContent({
  lang,
  products,
  title,
  intro,
  productLabel,
  priceLabel,
  viewProductLabel,
  contactText,
  contactLabel,
  units,
}: WholesaleContentProps) {
  const getUnitLabel = (unit: WholesaleUnit | undefined): string | null => {
    if (!unit) {
      return null;
    }

    return units[unit] ?? null;
  };

  return (
    <section className="relative mx-auto my-10 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">{title}</h1>

        <p className="mt-4 max-w-3xl text-base text-gray-400">{intro}</p>
      </div>

      {/* Wholesale list */}
      <div className="mt-10">
        {/* Desktop header */}
        <div className="hidden border-b border-gray-400/70 pb-3 sm:grid sm:grid-cols-[minmax(0,2fr)_220px]">
          <div className="text-xs font-medium text-gray-400">
            {productLabel}
          </div>

          <div className="text-right text-xs font-medium text-gray-400">
            {priceLabel}
          </div>
        </div>

        {/* Products */}
        <div>
          {products.map((product, index) => {
            const unitLabel = getUnitLabel(product.wholesaleUnit);

            return (
              <div
                key={product.id}
                className="grid grid-cols-1 gap-4 border-b border-gray-400/70 py-6 sm:grid-cols-[minmax(0,2fr)_220px] sm:items-center"
              >
                {/* Product */}
                <div className="min-w-0">
                  <div className="flex items-start gap-4">
                    {/* Number */}
                    <span className="mt-0.5 w-6 shrink-0 text-base font-medium text-gray-400">
                      {index + 1}.
                    </span>

                    {/* Title + link */}
                    <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                      <h2 className="min-w-0 text-base font-medium text-white sm:text-lg">
                        {product.title}
                      </h2>

                      <Link
                        href={`/${lang}/product/${product.handle}`}
                        className="w-fit shrink-0 border-b border-gray-400 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-300"
                      >
                        {viewProductLabel}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="pl-10 sm:pl-0 sm:text-right">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-sm sm:block">
                    <span className="font-medium text-gray-400 sm:hidden">
                      {priceLabel}
                    </span>

                    {unitLabel && (
                      <span className="font-normal text-gray-400 sm:hidden">
                        {unitLabel}
                      </span>
                    )}

                    <span className="font-semibold text-yellow-400">
                      {Number(product.wholesalePrice).toFixed(2)}{" "}
                      {product.currencyCode}
                    </span>

                    {unitLabel && (
                      <span className="hidden font-normal text-gray-400 sm:inline">
                        {" "}
                        / {unitLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-10 border-t border-white/10 pt-8">
        <p className="max-w-2xl text-base text-gray-400">{contactText}</p>

        <Link
          href={`/${lang}/partnership`}
          className="relative mt-6 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {contactLabel}
        </Link>
      </div>
    </section>
  );
}
