// app/[lang]/product/[handle]/page.tsx

import { Suspense } from "react";
import { fetchProductByHandleFlattened } from "../../../data/repo";
import { getMessages } from "../../messages";
import type { Locale } from "../../../lib/locale";
import { LOCALES } from "../../../lib/locale";
import ProductOverviews from "../../../components/ProductOverviews";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import CustomerReviews from "@/app/components/CustomerReviews";
import { getReviews } from "@/app/lib/getReviews";

type CategoryKey =
  | "beer"
  | "beer-boxes"
  | "draft-beer"
  | "cider"
  | "non-alcoholic"
  | "snacks"
  | "gifts-sets";

const VALID_CATEGORIES: CategoryKey[] = [
  "beer-boxes",
  "draft-beer",
  "non-alcoholic",
  "gifts-sets",
  "cider",
  "snacks",
  "beer",
];

function getCategoryFromProduct(
  collections: string[] | undefined,
): CategoryKey | undefined {
  if (!collections || collections.length === 0) {
    return undefined;
  }

  for (const validCategory of VALID_CATEGORIES) {
    if (collections.includes(validCategory)) {
      return validCategory;
    }
  }

  return undefined;
}

function normalizeLocale(raw: string): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{
    lang: string;
    handle: string;
  }>;

  searchParams: Promise<{
    category?: string;
  }>;
}) {
  const { lang: rawLang, handle } = await params;
  const { category } = await searchParams;

  const lang = normalizeLocale(rawLang);

  const t = await getMessages(lang);

  const product = await fetchProductByHandleFlattened(handle, lang);

  if (!product) {
    notFound();
  }

  // Если category пришла из URL и она валидная — используем её.
  const categoryFromQuery =
    category && VALID_CATEGORIES.includes(category as CategoryKey)
      ? (category as CategoryKey)
      : undefined;

  // Если category нет в URL — определяем её по коллекциям товара.
  const productCategory =
    categoryFromQuery ?? getCategoryFromProduct(product.collections);

  const productNumericId = product.id.split("/").pop()!;
  const reviews = await getReviews(productNumericId);

  return (
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10">
      <Suspense fallback={null}>
        <Breadcrumbs
          lang={lang}
          labels={{
            home: t.common.home,
            shop: t.common.shop,
            categories: {
              all: t.ShopTabs.all,
              beer: t.ShopTabs.beer,
              "beer-boxes": t.ShopTabs.beerBoxes,
              "draft-beer": t.ShopTabs.draftBeer,
              cider: t.ShopTabs.cider,
              "non-alcoholic": t.ShopTabs.nonAlcoholic,
              snacks: t.ShopTabs.snacks,
              "gifts-sets": t.ShopTabs.giftsSets,
            },
          }}
          productCategory={productCategory}
          currentLabel={product.title}
        />
      </Suspense>

      <ProductOverviews
        product={product}
        category={categoryFromQuery}
        perUnit={t.OneProduct.perUnit}
        box={t.OneProduct.box}
        pieces={t.OneProduct.pieces}
        piecesPerBox={t.OneProduct.piecesPerBox}
        abv={t.OneProduct.abv}
        ibu={t.OneProduct.ibu}
        fg={t.OneProduct.fg}
        country={t.OneProduct.country}
        brand={t.OneProduct.brand}
        style={t.OneProduct.style}
        addToCart={t.OneProduct.addToCart}
        reviews={t.OneProduct.reviews}
        outOf5Stars={t.OneProduct.outOf5Stars}
        viewAllReviews={t.OneProduct.viewAllReviews}
        leaveAReview={t.OneProduct.leaveAReview}
        description={t.OneProduct.description}
        tastedBestWith={t.OneProduct.tastedBestWith}
        allergens={t.OneProduct.allergens}
        ingredients={t.OneProduct.ingredients}
        ratingAverage={reviews.average}
        shelf_life_days={t.OneProduct.shelfLifeDays}
        days={t.OneProduct.days}
        volume={t.OneProduct.volume}
        reviewCount={reviews.totalCount}
        ean={t.OneProduct.ean}
        boxNumber={t.OneProduct.boxNumber}
      />

      <section id="product-reviews" className="mt-16">
        <CustomerReviews
          lang={lang}
          title={t.CustomerReviews.title}
          stars={t.CustomerReviews.stars}
          base1={t.CustomerReviews.base1}
          base2={t.CustomerReviews.base2}
          starRew={t.CustomerReviews.starRew}
          CTATitle={t.CustomerReviews.CTATitle}
          CTASubtitle={t.CustomerReviews.CTASubtitle}
          button={t.CustomerReviews.button}
          loginToReview={t.CustomerReviews.loginToReview}
          recentReviews={t.CustomerReviews.recentReviews}
          reviews={reviews}
          productExternalId={productNumericId}
          modalTexts={t.LeaveReviewModal}
        />
      </section>
    </main>
  );
}
