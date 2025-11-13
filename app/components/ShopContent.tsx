// app/components/ShopContent.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Tabs from "./ui/Tabs";
import AllProducts from "./AllProducts";
import type { FlattenedProduct } from "@/app/data/mappers";
import type { Locale } from "@/app/[lang]/messages";

type CategoryKey = "all" | "beer" | "cider" | "snacks";

interface ShopContentProps {
  products: FlattenedProduct[];
  translations: {
    title: string;
    stars: string;
    reviews: string;
    add: string;
    alcohol: string;
    noProducts: string;
    noProductsDescription: string;
    categories: Record<CategoryKey, string>;
  };
  lang: Locale;
}

const CATEGORIES: CategoryKey[] = ["all", "beer", "cider", "snacks"];

export default function ShopContent({
  products,
  translations,
  lang,
}: ShopContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // читаем таб из URL
  const tabFromUrl = (searchParams.get("category") ?? "all") as string;
  const initialTab: CategoryKey = CATEGORIES.includes(tabFromUrl as CategoryKey)
    ? (tabFromUrl as CategoryKey)
    : "all";

  const [activeTab, setActiveTab] = useState<CategoryKey>(initialTab);

  // если URL поменялся извне — синхронизируем состояние
  useEffect(() => {
    const urlTab = (searchParams.get("category") ?? "all") as string;
    const nextTab: CategoryKey = CATEGORIES.includes(urlTab as CategoryKey)
      ? (urlTab as CategoryKey)
      : "all";
    setActiveTab((prev) => (prev === nextTab ? prev : nextTab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // обёртка, чтобы менять и состояние, и URL
  const handleTabChange = (tab: CategoryKey) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === "all") {
      params.delete("category");
    } else {
      params.set("category", tab);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    return products.filter((p) => p.collections?.includes(activeTab));
  }, [products, activeTab]);

  const categoryTitle =
    translations.categories[activeTab] ?? translations.categories.all;

  return (
    <>
      <Tabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        labels={translations.categories}
      />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-6xl mb-4">🍺</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {translations.noProducts}
          </h3>
          <p className="text-gray-400 text-center max-w-md">
            {translations.noProductsDescription}
          </p>
        </div>
      ) : (
        <AllProducts
          title={categoryTitle}
          stars={translations.stars}
          reviews={translations.reviews}
          add={translations.add}
          alcohol={translations.alcohol}
          lang={lang}
          products={filteredProducts}
        />
      )}
    </>
  );
}
