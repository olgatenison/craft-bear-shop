// app/[lang]/shop/page.tsx
import { Suspense } from "react";
import { fetchAllProductsFlattened } from "../../data/repo";
import ShopContent from "@/app/components/ShopContent";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import type { Locale } from "../../lib/locale";
import { LOCALES } from "../../lib/locale";
import { getMessages } from "../messages";
import { getReviews } from "@/app/lib/getReviews";

function normalizeLocale(raw: string): Locale {
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : "en";
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLocale(rawLang);

  const { category } = await searchParams;
  const t = await getMessages(lang);

  const allProducts = await fetchAllProductsFlattened(lang);

  // Подмешиваем средний рейтинг и количество отзывов
  const productsWithRating = await Promise.all(
    allProducts.map(async (product) => {
      const productNumericId = product.id.split("/").pop()!;
      const reviews = await getReviews(productNumericId);

      return {
        ...product,
        rating: reviews.average,
        reviewCount: reviews.totalCount,
      };
    })
  );

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
              "draft-beer": t.ShopTabs.draftBeer,
              cider: t.ShopTabs.cider,
              "non-alcoholic": t.ShopTabs.nonAlcoholic,
              snacks: t.ShopTabs.snacks,
              "gifts-sets": t.ShopTabs.giftsSets,
            },
          }}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ShopContent
          products={productsWithRating}
          initialCategory={category}
          translations={{
            title: t.AllProducts.title,
            stars: t.AllProducts.stars,
            reviews: t.AllProducts.reviews,
            add: t.AllProducts.add,
            alcohol: t.AllProducts.alcohol,
            noProducts: t.AllProducts.noProducts,
            noProductsDescription: t.AllProducts.noProductsDescription,
            tabs: t.ShopTabs,
          }}
          lang={lang}
        />
      </Suspense>
    </main>
  );
}
