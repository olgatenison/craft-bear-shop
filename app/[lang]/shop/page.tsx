// app/[lang]/shop/page.tsx
import { fetchAllProductsFlattened } from "../../data/repo";
import ShopContent from "@/app/components/ShopContent";
import { getMessages, type Locale } from "../messages";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const t = await getMessages(lang);
  const allProducts = await fetchAllProductsFlattened();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <ShopContent
        products={allProducts}
        translations={t.AllProducts}
        lang={lang}
      />
    </main>
  );
}

/* <ProductOverviews
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
      /> */

/* <CustomerReviews
        title={t.CustomerReviews.title}
        stars={t.CustomerReviews.stars}
        base1={t.CustomerReviews.base1}
        base2={t.CustomerReviews.base2}
        starRew={t.CustomerReviews.starRew}
        CTATitle={t.CustomerReviews.CTATitle}
        CTASubtitle={t.CustomerReviews.CTASubtitle}
        button={t.CustomerReviews.button}
        recentReviews={t.CustomerReviews.recentReviews}
      /> */
