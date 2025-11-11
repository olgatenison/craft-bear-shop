// app/[lang]/product/[handle]/page.tsx
import { fetchProductByHandleFlattened } from "../../../data/repo";
import { getMessages, type Locale } from "../../messages";
import ProductOverviews from "../../../components/ProductOverviews";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { lang: Locale; handle: string };
}) {
  const { lang, handle } = params;
  const t = await getMessages(lang);
  const product = await fetchProductByHandleFlattened(handle);

  if (!product) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <ProductOverviews
        perUnit={t.perUnit}
        abv={t.abv}
        ibu={t.ibu}
        fg={t.fg}
        country={t.country}
        brand={t.brand}
        addToCart={t.addToCart}
        reviews={t.reviews}
        outOf5Stars={t.outOf5Stars}
        viewAllReviews={t.viewAllReviews}
        leaveAReview={t.leaveAReview}
        imagesSectionTitle={t.imagesSectionTitle}
        description={t.description}
        tastedBestWith={t.tastedBestWith}
        allergens={t.allergens}
        ingredients={t.ingredients}
        // і сам продукт передай у компонент (додай проп у ProductOverviews)
        // product={product}
      />
    </main>
  );
}
