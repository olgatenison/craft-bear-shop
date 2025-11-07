// app/[lang]/shop/page.tsx

import AllProducts from "../../components/AllProducts";
import TextBlockCenter from "../../components/ui/TextBlockCenter";
import { getMessages, type Locale } from "../messages";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = await getMessages(lang);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* заголовок страницы */}
      <TextBlockCenter
        title={t.shop?.title ?? "All products"}
        subtitle={t.shop?.subtitle ?? "Browse our full collection"}
      />

      {/* список всех товаров */}
      <AllProducts
        title={t.TrendingProducts.title}
        stars={t.TrendingProducts.stars}
        reviews={t.TrendingProducts.reviews}
        add={t.TrendingProducts.add}
        alcohol={t.TrendingProducts.alcohol}
      />
    </main>
  );
}
