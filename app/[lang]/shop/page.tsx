// app/[lang]/shop/page.tsx

import Tabs from "@/app/components/ui/Tabs";
import AllProducts from "../../components/AllProducts";
import TextBlockCenter from "../../components/ui/TextBlockCenter";
import { getMessages, type Locale } from "../messages";
import ProductOverviews from "@/app/components/ProductOverviews";
import CustomerReviews from "@/app/components/CustomerReviews";

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
      {/* <TextBlockCenter
        title={t.shop?.title ?? "All products"}
        subtitle={t.shop?.subtitle ?? "Browse our full collection"}
      /> */}
      <Tabs />
      <ProductOverviews
        perUnit={t.OneProduct.perUnit}
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
        imagesSectionTitle={t.OneProduct.images}
        description={t.OneProduct.description}
        tastedBestWith={t.OneProduct.tastedBestWith}
        allergens={t.OneProduct.allergens}
        ingredients={t.OneProduct.ingredients}
      />

      <CustomerReviews
        title={t.CustomerReviews.title}
        stars={t.CustomerReviews.stars}
        base1={t.CustomerReviews.base1}
        base2={t.CustomerReviews.base2}
        starRew={t.CustomerReviews.starRew}
        CTATitle={t.CustomerReviews.CTATitle}
        CTASubtitle={t.CustomerReviews.CTASubtitle}
        button={t.CustomerReviews.button}
        recentReviews={t.CustomerReviews.recentReviews}
      />

      {/* список всех товаров */}
      <AllProducts
        title={t.AllProducts.title}
        stars={t.AllProducts.stars}
        reviews={t.AllProducts.reviews}
        add={t.AllProducts.add}
        alcohol={t.AllProducts.alcohol}
      />
    </main>
  );
}
