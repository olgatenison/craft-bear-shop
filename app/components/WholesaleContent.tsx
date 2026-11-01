// app/components/WholesaleContent.tsx

import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

export type WholesaleProduct = {
  id: string;
  title: string;
  handle: string;
  wholesalePrice: string;
  currencyCode: string;
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
}: WholesaleContentProps) {
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
          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-1 gap-4 border-b border-gray-400/70 py-6 sm:grid-cols-[minmax(0,2fr)_220px] sm:items-center"
            >
              {/* Product */}
              <div>
                <h2 className="text-base font-medium text-white sm:text-lg">
                  {product.title}
                </h2>

                <Link
                  href={`/${lang}/product/${product.handle}`}
                  className="mt-3 inline-block border-b border-gray-400 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-300"
                >
                  {viewProductLabel}
                </Link>
              </div>

              {/* Price */}
              <div className="sm:text-right">
                <div className="text-xs font-medium text-gray-400 sm:hidden">
                  {priceLabel}
                </div>

                <div className="mt-1 text-base font-semibold text-yellow-400">
                  {Number(product.wholesalePrice).toFixed(2)}{" "}
                  {product.currencyCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-10 border-t border-white/10 pt-8">
        <p className="max-w-2xl text-base text-gray-400">{contactText}</p>

        <Link
          href={`/${lang}/contact`}
          className="relative mt-6 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {contactLabel}
        </Link>
      </div>
    </section>
  );
}
