// app/components/AllProducts.tsx
import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { WineOff } from "lucide-react";
import type { FlattenedProduct } from "../data/mappers";
import type { Locale } from "@/app/lib/locale";
import AddToCartButton from "./ui/AddToCartButton";

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

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
  // variants може бути відсутнім, або GraphQL connection
  variants?: VariantConnection;
};

type CategoryKey = "beer" | "cider" | "snacks";

type AllProductsProps = {
  title: string;
  stars: string;
  reviews: string;
  add: string;
  alcohol: string;
  rating?: string;

  lang: Locale;
  products: FlattenedProduct[];
  category?: CategoryKey;
};

export default function AllProducts({
  title,
  stars,
  reviews,
  add,
  alcohol,
  lang,
  products,
  category,
}: AllProductsProps) {
  return (
    <div className="mx-auto max-w-2xl  lg:max-w-7xl mt-10">
      <h2 className="text-2xl tracking-tight text-white">{title}</h2>

      <div className="mt-8 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {products.map((p) => {
          const img = p.featuredImage;
          const price = p.priceRange?.minVariantPrice;

          // ABV
          const abvRaw = p.specs?.abv;
          const abvNum =
            abvRaw !== undefined && abvRaw !== "" ? Number(abvRaw) : null;
          const hasAbv = abvNum !== null && !Number.isNaN(abvNum);
          const isAlcoholFree = hasAbv && abvNum === 0;

          // pack size (штучне)
          const packText = p.specs?.pack_size_l
            ? `${p.specs.pack_size_l} L`
            : null;

          // ✅ дістаємо variants без any
          const pv = p as unknown as ProductWithVariants;
          const variants: VariantNode[] =
            pv.variants?.edges?.map((e) => e.node) ?? [];

          // volume values (для розливного)
          const volumeValues = variants
            .map(
              (v) =>
                v.selectedOptions.find((o) => o.name.toLowerCase() === "volume")
                  ?.value
            )
            .filter((val): val is string => Boolean(val))
            .map((x) => Number(String(x).replace(",", ".")))
            .filter((n) => !Number.isNaN(n));

          const minVolume = volumeValues.length
            ? Math.min(...volumeValues)
            : null;

          // “за …” біля ціни: pack_size_l або min volume
          const unitForPrice =
            packText ?? (minVolume ? `${minVolume} L` : null);

          // meta під назвою (ABV • Pack) — як у тебе
          const metaParts: string[] = [];
          if (hasAbv) metaParts.push(`${abvNum} %`);
          if (packText) metaParts.push(packText);
          const meta = metaParts.join(" • ");

          // рейтинг
          const productRating = p.rating ?? 0;
          const productReviewCount = p.reviewCount ?? 0;

          const href = `/${lang}/product/${p.handle}${
            category ? `?category=${category}` : ""
          }`;

          return (
            <div key={p.id} className="group flex flex-col h-full">
              <div className="relative flex-1 flex flex-col">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-600 transition-colors duration-300 group-hover:bg-white">
                  {img?.url && (
                    <Image
                      src={img.url}
                      alt={img.altText ?? p.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-contain p-3 transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-105"
                    />
                  )}

                  {isAlcoholFree && (
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

                <div className="mt-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-yellow-400 pb-6 pr-6 text-balance">
                      <Link
                        href={href}
                        className="focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
                      >
                        {p.title}
                        <span
                          className="absolute inset-0 rounded-lg"
                          aria-hidden="true"
                        />
                      </Link>
                    </h3>

                    {meta && <p className="text-xs text-gray-300">{meta}</p>}
                  </div>

                  {/* Ціна: число велике, EUR + “за …” дрібніше */}
                  <p className="text-right leading-tight">
                    {price ? (
                      <>
                        <span className="text-lg font-semibold text-white">
                          {Number(price.amount).toFixed(2)}
                        </span>
                        <span className="block text-xs font-medium text-gray-300">
                          {price.currencyCode}
                        </span>

                        {unitForPrice && (
                          <span className="block text-xs text-gray-400">
                            за {unitForPrice}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        —
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Рейтинг + отзывы */}
              <div className="mt-3 flex flex-col">
                <span className="sr-only">
                  {productRating} {stars}
                </span>
                <div className="flex">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon
                      key={i}
                      aria-hidden="true"
                      className={classNames(
                        productRating > i ? "text-yellow-400" : "text-gray-500",
                        "size-3 shrink-0"
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {productReviewCount} {reviews}
                </p>
              </div>

              {/* Add to cart */}
              <div className="mt-6">
                <AddToCartButton
                  product={p}
                  addToCart={add}
                  className="relative flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
