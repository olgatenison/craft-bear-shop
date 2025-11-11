// app/components/ShopContent.tsx
"use client";

import { useState } from "react";
import Tabs from "./ui/Tabs";
import AllProducts from "./AllProducts";
import type { FlattenedProduct } from "@/app/data/mappers";
import type { Locale } from "@/app/[lang]/messages";

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
    categories: {
      all: string;
      beer: string;
      cider: string;
      snacks: string;
    };
  };
  lang: Locale;
}

export default function ShopContent({
  products,
  translations,
  lang,
}: ShopContentProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filteredProducts = products.filter((product) => {
    if (activeTab === "all") return true;
    return product.collections.includes(activeTab);
  });

  // Получаем название категории
  const categoryTitle =
    translations.categories[
      activeTab as keyof typeof translations.categories
    ] || translations.categories.all;

  return (
    <>
      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
