// app/components/TrendingProducts.tsx

import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import { WineOff } from "lucide-react";
import Link from "next/link";
import type { FlattenedProduct } from "@/app/data/mappers";
import type { Locale } from "@/app/lib/locale";
import AddToCartButton from "./ui/AddToCartButton";
import { getReviews } from "@/app/lib/getReviews";

// --- types for variants (no any) ---
type VariantSelectedOption = { name: string; value: string };

type VariantNode = {
  id: string;
  title: string;
  price?: { amount: string; currencyCode: string };
  selectedOptions: VariantSelectedOption[];
};

type VariantEdge = { node: VariantNode };
type VariantConnection = { edges: VariantEdge[] };

type ProductWithVariants = FlattenedProduct & {
  variants?: VariantConnection;
};

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

type TrendingProductsProps = {
  products: FlattenedProduct[];
  title: string;
  stars: string;
  reviews: string;
  add: string;
  alcohol: string;
  lang: Locale;
};

export default async function TrendingProducts({
  products,
  title,
  stars,
  reviews,
  add,
  alcohol,
  lang,
}: TrendingProductsProps) {
  if (!products.length) return null;

  const reviewsArray = await Promise.all(
    products.map(async (product) => {
      const numericId = product.id.split("/").pop()!;
      const data = await getReviews(numericId);
      return { productId: product.id, data };
    })
  );

  const reviewsMap = new Map(
    reviewsArray.map((item) => [item.productId, item.data])
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl px-6 py-12 md:py-16  lg:max-w-7xl ">
        <h2 className="text-center md:text-left text-3xl font-bold md:font-normal md:text-3xl tracking-tight text-white">
          {title}
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 items-stretch">
          {products.map((product) => {
            const abv = product.specs?.abv
              ? Number(product.specs.abv)
              : undefined;

            const priceObj = product.priceRange?.minVariantPrice;

            // ✅ pack size (штучне)
            const packText = product.specs?.pack_size_l
              ? `${product.specs.pack_size_l} L`
              : null;

            // ✅ якщо pack_size_l немає — пробуємо визначити “за 0.5 L” через variants.volume
            const pv = product as unknown as ProductWithVariants;
            const variants: VariantNode[] =
              pv.variants?.edges?.map((e) => e.node) ?? [];

            const volumeValues = variants
              .map(
                (v) =>
                  v.selectedOptions.find(
                    (o) => o.name.toLowerCase() === "volume"
                  )?.value
              )
              .filter((val): val is string => Boolean(val))
              .map((x) => Number(String(x).replace(",", ".")))
              .filter((n) => !Number.isNaN(n));

            const minVolume = volumeValues.length
              ? Math.min(...volumeValues)
              : null;

            const unitForPrice =
              packText ?? (minVolume ? `${minVolume} L` : null);

            // ⭐ рейтинги (Supabase)
            const reviewStats = reviewsMap.get(product.id);
            const rating = reviewStats?.average ?? 0;
            const reviewCount = reviewStats?.totalCount ?? 0;

            const href = `/${lang}/product/${product.handle}`;

            return (
              <div key={product.id} className="group flex flex-col h-full">
                <div className="relative flex-1 flex flex-col">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-700 transition-colors duration-300 group-hover:bg-white">
                    <Image
                      src={
                        product.featuredImage?.url ??
                        "/category/Steam_Beer_700x700px.webp"
                      }
                      alt={product.featuredImage?.altText ?? product.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-contain transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-105 p-3"
                    />

                    {abv !== undefined && abv === 0 && (
                      <span
                        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-1 text-[10px] font-semibold uppercase text-white shadow-lg ring-1 ring-black/10"
                        aria-label={alcohol}
                      >
                        <WineOff className="h-3.5 w-3.5" aria-hidden="true" />
                        {alcohol}
                        <span className="sr-only">{alcohol}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-medium text-white pr-6 text-balance">
                        <Link href={href} className="focus:outline-none ">
                          {product.title}
                          <span
                            className="absolute inset-0 rounded-lg"
                            aria-hidden="true"
                          />
                        </Link>
                      </h3>

                      {/* ABV */}
                      {abv !== undefined && (
                        <p className="mt-1 text-sm text-gray-300">{abv} %</p>
                      )}

                      {/* pack size (для штучного) */}
                      {packText && (
                        <p className="mt-1 text-xs text-gray-400">{packText}</p>
                      )}
                    </div>

                    {/* ✅ Ціна: число велике, EUR + “за …” дрібніше */}
                    {priceObj && (
                      <p className="text-right leading-tight w-30">
                        <span className="text-lg font-semibold text-white">
                          {Number(priceObj.amount).toFixed(2)}
                        </span>
                        <span className="block text-xs font-medium text-gray-300">
                          {priceObj.currencyCode}
                        </span>
                        {unitForPrice && (
                          <span className="block text-xs text-gray-400">
                            за {unitForPrice}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* ⭐ звезды + отзывы */}
                  <div className="mt-3 flex flex-col">
                    <span className="sr-only">
                      {rating} {stars}
                    </span>
                    <div className="flex">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <StarIcon
                          key={i}
                          aria-hidden="true"
                          className={classNames(
                            rating > i ? "text-yellow-400" : "text-gray-500",
                            "size-5 shrink-0"
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {reviewCount} {reviews}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <AddToCartButton
                    product={product}
                    addToCart={add}
                    className="relative flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
