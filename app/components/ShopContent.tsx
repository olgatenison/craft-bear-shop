// app/components/ShopContent.tsx

"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Tabs from "./ui/Tabs";
import AllProducts from "./AllProducts";
import type { FlattenedProduct } from "@/app/data/mappers";
import type { Locale } from "@/app/[lang]/messages";
import ScrollToTopButton from "@/app/components/ui/ScrollToTopButton";

type TabId =
  | "all"
  | "beer"
  | "draft-beer"
  | "cider"
  | "non-alcoholic"
  | "snacks"
  | "gifts-sets";

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

    tabs: {
      all: string;
      beer: string;
      draftBeer?: string;
      cider: string;
      snacks: string;
      nonAlcoholic?: string;
      giftsSets?: string;
    };
  };
  lang: Locale;
  initialCategory?: string;
}

const TABS: TabId[] = [
  "all",
  "beer",
  "draft-beer",
  "cider",
  "non-alcoholic",
  "snacks",
  "gifts-sets",
];

function getTabTitle(tab: TabId, t: ShopContentProps["translations"]["tabs"]) {
  switch (tab) {
    case "all":
      return t.all;

    case "beer":
      return t.beer;

    case "draft-beer":
      return t.draftBeer ?? "Draft beer";

    case "cider":
      return t.cider;

    case "non-alcoholic":
      return t.nonAlcoholic ?? "Non-alcoholic";

    case "snacks":
      return t.snacks;

    case "gifts-sets":
      return t.giftsSets ?? "Gifts & Sets";
  }
}

export default function ShopContent({
  products,
  translations,
  lang,
  initialCategory,
}: ShopContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Оставляем только те табы, в которых реально есть товары
  const availableTabs = useMemo<TabId[]>(() => {
    return TABS.filter((tab) => {
      if (tab === "all") return true;

      return products.some((product) => product.collections?.includes(tab));
    });
  }, [products]);

  const categoryParam =
    searchParams.get("category") ?? initialCategory ?? "all";

  const activeTab: TabId = TABS.includes(categoryParam as TabId)
    ? (categoryParam as TabId)
    : "all";

  const handleTabChange = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());

    if (tab === "all") {
      params.delete("category");
    } else {
      params.set("category", tab);
    }

    const qs = params.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, {
      scroll: false,
    });
  };

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;

    return products.filter((product) =>
      product.collections?.includes(activeTab),
    );
  }, [products, activeTab]);

  const categoryTitle = getTabTitle(activeTab, translations.tabs);

  const currentCategory =
    activeTab === "beer" || activeTab === "cider" || activeTab === "snacks"
      ? activeTab
      : undefined;

  return (
    <>
      <Tabs
        activeTab={activeTab}
        onTabChange={(tab) => handleTabChange(tab as TabId)}
        labels={translations.tabs}
        visibleTabs={availableTabs}
      />

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="my-4 text-6xl">🍺</div>

          <h3 className="mb-2 text-2xl font-bold text-white">
            {translations.noProducts}
          </h3>

          <p className="max-w-md text-center text-gray-400">
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
          category={currentCategory}
        />
      )}

      <ScrollToTopButton />
    </>
  );
}
