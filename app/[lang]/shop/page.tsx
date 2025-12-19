// app/[lang]/shop/page.tsx
import { fetchAllProductsFlattened } from "../../data/repo";
import ShopContent from "@/app/components/ShopContent";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import type { Locale } from "../../lib/locale";
import { getMessages } from "../messages";
import { getReviews } from "@/app/lib/getReviews";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
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
    <main className="mx-auto max-w-7xl px-6 pb-16 pt-10 ">
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

      <ShopContent
        products={productsWithRating}
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
    </main>
  );
}

// type ShopPageProps = {
//   params: { lang: Locale };
// };

// export default async function ShopPage({ params: { lang } }: ShopPageProps) {
//   const t = await getMessages(lang);
//   const allProducts = await fetchAllProductsFlattened(lang);

//   return (
//     <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
//       <Breadcrumbs
//         lang={lang}
//         labels={{
//           home: t.common.home,
//           shop: t.common.shop,
//           categories: t.AllProducts.categories,
//         }}
//       />
//       <ShopContent
//         products={allProducts}
//         translations={t.AllProducts}
//         lang={lang}
//       />
//     </main>
//   );
// }
