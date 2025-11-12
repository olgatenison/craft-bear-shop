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
