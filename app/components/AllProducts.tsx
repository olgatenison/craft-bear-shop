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

type VariantSelectedOption = {
  name: string;
  value: string;
};

type VariantImage = {
  url: string;
  altText?: string | null;
};

type VariantNode = {
  id: string;
  title: string;

  price?: {
    amount: string;
    currencyCode: string;
  };

  image?: VariantImage | null;

  selectedOptions: VariantSelectedOption[];
};

type VariantEdge = {
  node: VariantNode;
};

type VariantConnection = {
  edges: VariantEdge[];
};

type ProductWithVariants = FlattenedProduct & {
  variants?: VariantConnection;
};

type CategoryKey =
  | "beer"
  | "beer-boxes"
  | "kegs"
  | "draft-beer"
  | "cider"
  | "non-alcoholic"
  | "snacks"
  | "gifts-sets";

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

function getPackageType(variant: VariantNode): string | undefined {
  return variant.selectedOptions
    .find((option) => {
      const name = option.name.trim().toLowerCase();

      return name === "package type" || name === "package" || name === "pack";
    })
    ?.value.trim()
    .toLowerCase();
}

function getVolume(variant: VariantNode): number | null {
  const value = variant.selectedOptions.find(
    (option) => option.name.trim().toLowerCase() === "volume",
  )?.value;

  if (!value) {
    return null;
  }

  const parsed = Number(String(value).replace(",", "."));

  return Number.isNaN(parsed) ? null : parsed;
}

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
    <div className="mx-auto mt-10 max-w-2xl lg:max-w-7xl">
      <h2 className="text-2xl tracking-tight text-white">{title}</h2>

      <div className="mt-8 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {products.map((p) => {
          const pv = p as unknown as ProductWithVariants;

          const variants: VariantNode[] =
            pv.variants?.edges?.map((edge) => edge.node) ?? [];

          const isBoxCategory = category === "beer-boxes";

          const isKegCategory = category === "kegs";

          /*
           * --------------------------------------------------
           * BOX
           * --------------------------------------------------
           *
           * Используем только в beer-boxes
           */

          const boxVariant = isBoxCategory
            ? variants.find((variant) => getPackageType(variant) === "box")
            : undefined;

          /*
           * --------------------------------------------------
           * KEG 30 L
           * --------------------------------------------------
           *
           * Используем только в kegs
           */

          const kegVariant = isKegCategory
            ? variants.find((variant) => getVolume(variant) === 30)
            : undefined;

          /*
           * --------------------------------------------------
           * ACTIVE SPECIAL VARIANT
           * --------------------------------------------------
           */

          const selectedVariant = isBoxCategory
            ? boxVariant
            : isKegCategory
              ? kegVariant
              : undefined;

          /*
           * --------------------------------------------------
           * IMAGE
           * --------------------------------------------------
           */

          const img = selectedVariant?.image?.url
            ? selectedVariant.image
            : p.featuredImage;

          /*
           * --------------------------------------------------
           * PRICE
           * --------------------------------------------------
           */

          const price = selectedVariant?.price
            ? selectedVariant.price
            : p.priceRange?.minVariantPrice;

          /*
           * --------------------------------------------------
           * CART PRODUCT
           * --------------------------------------------------
           *
           * Box category -> Box variant
           * Kegs -> 30L variant
           */

          const productForCart: FlattenedProduct = selectedVariant
            ? {
                ...p,
                variantId: selectedVariant.id,
              }
            : p;

          /*
           * --------------------------------------------------
           * ABV
           * --------------------------------------------------
           */

          const abvRaw = p.specs?.abv;

          const abvNum =
            abvRaw !== undefined && abvRaw !== "" ? Number(abvRaw) : null;

          const hasAbv = abvNum !== null && !Number.isNaN(abvNum);

          const isAlcoholFree = hasAbv && abvNum === 0;

          /*
           * --------------------------------------------------
           * NORMAL PACK SIZE
           * --------------------------------------------------
           */

          const packText = p.specs?.pack_size_l
            ? `${p.specs.pack_size_l} L`
            : null;

          /*
           * --------------------------------------------------
           * BOTTLES IN BOX
           * --------------------------------------------------
           */

          const bottleInBoxRaw = p.specs?.bottle_in_box;

          const bottleInBox =
            bottleInBoxRaw !== undefined && bottleInBoxRaw !== ""
              ? Number(bottleInBoxRaw)
              : null;

          const hasBottleInBox =
            bottleInBox !== null &&
            !Number.isNaN(bottleInBox) &&
            bottleInBox > 0;

          /*
           * --------------------------------------------------
           * DRAFT VOLUMES
           * --------------------------------------------------
           *
           * 30L не учитываем как обычный
           * потребительский объём Draft Beer.
           */

          const volumeValues = variants
            .map((variant) => getVolume(variant))
            .filter((value): value is number => value !== null && value !== 30);

          const minVolume = volumeValues.length
            ? Math.min(...volumeValues)
            : null;

          /*
           * --------------------------------------------------
           * UNIT NEXT TO PRICE
           * --------------------------------------------------
           */

          const unitForPrice = isBoxCategory
            ? hasBottleInBox
              ? `${bottleInBox} bottles`
              : "box"
            : isKegCategory
              ? "30 L keg"
              : (packText ?? (minVolume ? `${minVolume} L` : null));

          /*
           * --------------------------------------------------
           * META UNDER TITLE
           * --------------------------------------------------
           */

          const metaParts: string[] = [];

          if (hasAbv) {
            metaParts.push(`${abvNum} %`);
          }

          if (isBoxCategory) {
            if (hasBottleInBox) {
              metaParts.push(`${bottleInBox} bottles`);
            }
          } else if (isKegCategory) {
            metaParts.push("30 L keg");
          } else if (packText) {
            metaParts.push(packText);
          }

          const meta = metaParts.join(" • ");

          /*
           * --------------------------------------------------
           * RATING
           * --------------------------------------------------
           */

          const productRating = p.rating ?? 0;
          const productReviewCount = p.reviewCount ?? 0;

          /*
           * --------------------------------------------------
           * LINK
           * --------------------------------------------------
           */

          const href = `/${lang}/product/${p.handle}${
            category ? `?category=${category}` : ""
          }`;

          return (
            <div key={p.id} className="group flex h-full flex-col">
              <div className="relative flex flex-1 flex-col">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-600 transition-colors duration-300 group-hover:bg-white">
                  {img?.url && (
                    <Image
                      src={img.url}
                      alt={img.altText ?? p.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="transform-gpu object-contain p-3 transition-transform duration-300 will-change-transform group-hover:scale-105"
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
                    <h3 className="pb-6 pr-6 text-balance text-lg font-medium text-yellow-400">
                      <Link
                        href={href}
                        className="relative inline-block max-w-full rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
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

                  <p className="w-30 text-right leading-tight">
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

              {/* Rating */}
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
                        "size-3 shrink-0",
                      )}
                    />
                  ))}
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {productReviewCount} {reviews}
                </p>
              </div>

              {/* Add to cart */}
              <div className="mt-6 w-full">
                <AddToCartButton
                  product={productForCart}
                  addToCart={add}
                  className="relative flex w-full items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 sm:w-auto"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
