// app/components/ProductOverviews.tsx

import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import type { FlattenedProduct } from "../data/mappers";
import AddToCartButton from "./ui/AddToCartButton";

type ProductOverviewsProps = {
  product: FlattenedProduct;
  category?: string;

  perUnit: string;
  box: string;
  pieces: string;
  piecesPerBox: string;

  abv: string;
  ibu: string;
  fg: string;
  country: string;
  brand: string;
  style: string;
  addToCart: string;
  reviews: string;
  outOf5Stars: string;
  viewAllReviews: string;
  leaveAReview: string;
  description: string;
  tastedBestWith: string;
  allergens: string;
  ingredients: string;
  ratingAverage: number;
  reviewCount: number;
  shelf_life_days: string;
  days: string;
  volume: string;
  ean: string;
  boxNumber: string;
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type VariantSelectedOption = {
  name: string;
  value: string;
};

type VariantNode = {
  id: string;
  title?: string;

  price?: {
    amount: string;
    currencyCode: string;
  };

  image?: {
    url: string;
    altText?: string | null;
  } | null;

  selectedOptions?: VariantSelectedOption[];

  availableForSale?: boolean;
  quantityAvailable?: number | null;
};

type VariantEdge = {
  node: VariantNode;
};

type VariantConnection = {
  edges: VariantEdge[];
};

type ProductWithVariants = FlattenedProduct & {
  variants?: VariantConnection | VariantNode[];
};

function isVariantConnection(value: unknown): value is VariantConnection {
  return (
    typeof value === "object" &&
    value !== null &&
    "edges" in value &&
    Array.isArray((value as { edges?: unknown }).edges)
  );
}

function getVariantNodes(product: ProductWithVariants): VariantNode[] {
  const variants = product.variants;

  if (!variants) return [];

  if (Array.isArray(variants)) {
    return variants;
  }

  if (isVariantConnection(variants)) {
    return variants.edges.map((edge) => ({
      ...edge.node,
      quantityAvailable: edge.node.quantityAvailable ?? undefined,
    }));
  }

  return [];
}

function getPackageType(variant: VariantNode): string | undefined {
  return variant.selectedOptions
    ?.find((option) => {
      const name = option.name.trim().toLowerCase();

      return name === "package type" || name === "package" || name === "pack";
    })
    ?.value.trim()
    .toLowerCase();
}

export default function ProductOverviews({
  product,
  category,

  perUnit,
  box,
  pieces,
  piecesPerBox,

  abv,
  ibu,
  fg,
  country,
  brand,
  style,
  addToCart,
  reviews,
  outOf5Stars,
  viewAllReviews,
  leaveAReview,
  description,
  tastedBestWith,
  allergens,
  ingredients,
  ratingAverage,
  reviewCount,
  shelf_life_days,
  days,
  volume,
  ean,
  boxNumber,
}: ProductOverviewsProps) {
  const packSize = product.specs?.pack_size_l;

  const productAbv = product.specs?.abv;
  const productIbu = product.specs?.ibu;
  const productFg = product.specs?.fg;
  const productCountry = product.specs?.country;
  const productBrand = product.specs?.brand;

  const productStyle = product.shopify?.["beer-style"];

  const productAllergens = product.specs?.allergens;

  const productIngredients = product.specs?.ingredients;

  const productPairing = product.specs?.pairing;

  const productShelfLifeDays = product.specs?.shelf_life_days;

  const productVolume = product.specs?.volume;

  const productGtin = product.specs?.gtin;

  const productBoxNumber = product.specs?.box_number;

  const bottleInBoxRaw = product.specs?.bottle_in_box;

  const bottleInBox =
    bottleInBoxRaw !== undefined &&
    bottleInBoxRaw !== "" &&
    !Number.isNaN(Number(bottleInBoxRaw))
      ? Number(bottleInBoxRaw)
      : null;

  const rawVariants = getVariantNodes(product as ProductWithVariants);

  const isBeerBox = category === "beer-boxes";

  const boxVariant = isBeerBox
    ? rawVariants.find((variant) => getPackageType(variant) === "box")
    : undefined;

  const displayPrice =
    isBeerBox && boxVariant?.price?.amount
      ? boxVariant.price.amount
      : product.priceRange.minVariantPrice.amount;

  const productForCart: FlattenedProduct =
    isBeerBox && boxVariant
      ? {
          ...product,
          variantId: boxVariant.id,
        }
      : product;

  const getVolumeVariant = (value: "0.5" | "1") =>
    rawVariants.find((variant) =>
      (variant.selectedOptions ?? []).some(
        (option) =>
          option.name.toLowerCase() === "volume" && option.value === value,
      ),
    );

  const vHalf = getVolumeVariant("0.5");
  const vLiter = getVolumeVariant("1");

  const isDraft =
    !isBeerBox && Boolean(vHalf?.price?.amount && vLiter?.price?.amount);

  const productImages =
    product.images?.edges.map((edge) => ({
      imageSrc: edge.node.url,
      imageAlt: edge.node.altText || product.title,
    })) ?? [];

  const boxImage =
    isBeerBox && boxVariant?.image?.url
      ? {
          imageSrc: boxVariant.image.url,
          imageAlt: boxVariant.image.altText || `${product.title} ${box}`,
        }
      : null;

  const orderedImages = boxImage
    ? [
        boxImage,
        ...productImages.filter(
          (image) => image.imageSrc !== boxImage.imageSrc,
        ),
      ]
    : productImages;

  const images = orderedImages.map((image, index) => ({
    id: index + 1,
    imageSrc: image.imageSrc,
    imageAlt: image.imageAlt,
    primary: index === 0,
  }));

  const rating = ratingAverage ?? 0;

  const pairingList = productPairing
    ? productPairing
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const productHalf: FlattenedProduct | null =
    isDraft && vHalf
      ? {
          ...product,
          variantId: vHalf.id,
        }
      : null;

  const productLiter: FlattenedProduct | null =
    isDraft && vLiter
      ? {
          ...product,
          variantId: vLiter.id,
        }
      : null;

  return (
    <div>
      <div>
        <div className="mx-auto mt-8 max-w-2xl lg:max-w-7xl">
          <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
            {/* Title and price */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="flex items-baseline justify-between gap-10">
                <h1 className="max-w-md text-balance text-3xl font-semibold tracking-tight text-yellow-400">
                  {product.title}

                  {isBeerBox ? (
                    <span className="ml-3 text-xl text-white">
                      {bottleInBox ? `${bottleInBox} ${pieces}` : box}
                    </span>
                  ) : isDraft ? (
                    <span className="ml-3 text-xl text-white">0.5 / 1 L</span>
                  ) : (
                    packSize && (
                      <span className="ml-3 text-xl text-white">
                        {packSize} L
                      </span>
                    )
                  )}

                  {!isBeerBox && productVolume && (
                    <span className="ml-3 text-xl text-white">
                      {productVolume} g
                    </span>
                  )}
                </h1>

                <div className="flex flex-col items-end text-right">
                  {isDraft && vHalf?.price?.amount && vLiter?.price?.amount ? (
                    <>
                      <span className="whitespace-nowrap text-2xl font-medium text-white">
                        {Number(vHalf.price.amount).toFixed(2)} €
                        <span className="ml-2 text-base text-gray-300">
                          / 0.5 L
                        </span>
                      </span>

                      <span className="whitespace-nowrap text-base text-gray-300">
                        {Number(vLiter.price.amount).toFixed(2)} € / 1 L
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="whitespace-nowrap text-2xl font-medium text-white">
                        {Number(displayPrice).toFixed(2)} €
                      </span>

                      <span className="whitespace-nowrap text-base text-gray-300">
                        {isBeerBox
                          ? bottleInBox
                            ? `${bottleInBox} ${piecesPerBox}`
                            : box
                          : perUnit}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Product country and ABV / IBU / FG */}
              <div className="mt-10 flex w-full items-center justify-start gap-5">
                {productAbv && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="whitespace-nowrap text-lg font-semibold text-white">
                        {abv}:
                      </span>

                      <span className="text-base text-gray-300">
                        {productAbv}%
                      </span>
                    </div>

                    {(productIbu || productFg) && "|"}
                  </>
                )}

                {productIbu && (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="whitespace-nowrap text-lg font-semibold text-white">
                        {ibu}:
                      </span>

                      <span className="text-base text-gray-300">
                        {productIbu}
                      </span>
                    </div>

                    {productFg && "|"}
                  </>
                )}

                {productFg && (
                  <div className="flex items-baseline gap-2">
                    <span className="whitespace-nowrap text-lg font-semibold text-white">
                      {fg}:
                    </span>

                    <span className="text-base text-gray-300">
                      {productFg}°
                    </span>
                  </div>
                )}
              </div>

              {productCountry && (
                <div className="flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {country}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productCountry}
                  </span>
                </div>
              )}

              {productBrand && (
                <div className="flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {brand}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productBrand}
                  </span>
                </div>
              )}

              {productStyle && (
                <div className="mt-10 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {style}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productStyle}
                  </span>
                </div>
              )}

              {/* Reviews */}
              <div className="mt-10">
                <h2 className="sr-only">{reviews}</h2>

                <button
                  type="button"
                  className="flex w-full items-center justify-between transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center">
                    <div className="mr-2 flex items-center">
                      {[0, 1, 2, 3, 4].map((ratingValue) => (
                        <StarIcon
                          key={ratingValue}
                          aria-hidden="true"
                          className={classNames(
                            rating > ratingValue
                              ? "text-yellow-400"
                              : "text-gray-500",
                            "size-5 shrink-0",
                          )}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-gray-500">
                      {rating.toFixed(1)}

                      <span className="sr-only">{outOf5Stars}</span>
                    </p>
                  </div>

                  <a
                    href="#product-reviews"
                    className="text-sm font-medium text-gray-400 transition-colors hover:text-yellow-500"
                  >
                    {reviewCount > 0 ? viewAllReviews : leaveAReview}
                  </a>
                </button>
              </div>
            </div>

            {/* Image gallery */}
            <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:-mt-6">
              <div className="group grid grid-cols-1 lg:grid-cols-2 lg:gap-8 lg:p-6 lg:pl-0">
                {images.length > 0 ? (
                  images.map((image) => (
                    <div
                      key={image.id}
                      className={classNames(
                        image.primary
                          ? "lg:col-span-2 lg:row-span-2"
                          : "hidden lg:block",
                        "relative aspect-square w-full overflow-hidden rounded-lg bg-stone-200 transition-colors duration-300",
                      )}
                    >
                      <Image
                        alt={image.imageAlt}
                        src={image.imageSrc}
                        fill
                        sizes="(min-width:1024px) 40vw, 100vw"
                        className="object-contain object-center"
                        priority={image.primary}
                      />
                    </div>
                  ))
                ) : (
                  <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-stone-200 lg:col-span-2 lg:row-span-2">
                    <p className="text-gray-500">No images available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Button and right side under */}
            <div className="mt-5 lg:col-span-5 lg:mt-10">
              {isDraft && productHalf && productLiter ? (
                <div className="flex gap-3">
                  <AddToCartButton
                    product={productHalf}
                    addToCart={`${addToCart} 0.5 L`}
                  />

                  <AddToCartButton
                    product={productLiter}
                    addToCart={`${addToCart} 1 L`}
                  />
                </div>
              ) : (
                <AddToCartButton
                  product={productForCart}
                  addToCart={addToCart}
                />
              )}

              {/* Product Description */}
              {product.descriptionHtml && (
                <div className="mt-8 border-t border-white/10 pt-8">
                  <h2 className="text-lg font-semibold text-white">
                    {description}:
                  </h2>

                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml,
                    }}
                    className="
                      mt-4 text-base leading-7 text-gray-300
                      [&_p]:mt-3 [&_p:first-child]:mt-0
                      [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5
                      [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-5
                      [&_li]:mt-1
                      [&_a]:text-yellow-400 [&_a:hover]:text-yellow-300
                      [&_strong]:text-white
                    "
                  />
                </div>
              )}

              {/* Tasted best with */}
              {pairingList.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h2 className="mx-auto mt-6 max-w-lg text-pretty text-lg font-semibold text-white">
                    {tastedBestWith}
                  </h2>

                  <div className="mt-4">
                    <ul
                      role="list"
                      className="list-disc space-y-1 pl-5 text-balance text-sm text-gray-300 marker:text-gray-300"
                    >
                      {pairingList.map((item, index) => (
                        <li key={index} className="pl-2 text-base">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Box info */}
              {isBeerBox && bottleInBox && (
                <div className="mt-6 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {boxNumber}:
                  </span>

                  <span className="text-base text-gray-300">
                    {bottleInBox} {pieces}
                  </span>
                </div>
              )}

              {/* Weight */}
              {!isBeerBox && productVolume && (
                <div className="mt-6 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {volume}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productVolume} g
                  </span>
                </div>
              )}

              {/* Volume */}
              {!isBeerBox &&
                (isDraft ? (
                  <div className="mt-6 flex w-full items-baseline gap-2">
                    <span className="whitespace-nowrap text-lg font-semibold text-white">
                      {volume}:
                    </span>

                    <span className="text-base text-gray-300">0.5 / 1 L</span>
                  </div>
                ) : (
                  packSize && (
                    <div className="mt-6 flex w-full items-baseline gap-2">
                      <span className="whitespace-nowrap text-lg font-semibold text-white">
                        {volume}:
                      </span>

                      <span className="text-base text-gray-300">
                        {packSize} L
                      </span>
                    </div>
                  )
                ))}

              {/* Allergens */}
              {productAllergens && (
                <div className="mt-6 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {allergens}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productAllergens}
                  </span>
                </div>
              )}

              {/* Ingredients */}
              {productIngredients && (
                <div className="mt-6 flex w-full flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                  <span className="text-lg font-semibold text-white">
                    {ingredients}:
                  </span>

                  <span className="text-balance text-base text-gray-300">
                    {productIngredients}
                  </span>
                </div>
              )}

              {/* Shelf life */}
              {productShelfLifeDays && (
                <div className="mt-6 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {shelf_life_days}:
                  </span>

                  <span className="text-base text-gray-300">
                    {productShelfLifeDays} {days}
                  </span>
                </div>
              )}

              {/* EAN / GTIN */}
              {productGtin && (
                <div className="mt-6 flex w-full items-baseline gap-2">
                  <span className="whitespace-nowrap text-lg font-semibold text-white">
                    {ean}:
                  </span>

                  <span className="text-base text-gray-300">{productGtin}</span>
                </div>
              )}

              {/* Existing boxNumber */}
              {!isBeerBox &&
                productBoxNumber !== undefined &&
                productBoxNumber !== null && (
                  <div className="mt-6 flex w-full items-baseline gap-2">
                    <span className="whitespace-nowrap text-lg font-semibold text-white">
                      {boxNumber}:
                    </span>

                    <span className="text-base text-gray-300">
                      {productBoxNumber}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
