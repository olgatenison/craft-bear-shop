// app/data/mappers.ts
import type { ProductNode } from "./types";

export type FlattenedProduct = Omit<ProductNode, "metafields"> & {
  collections: string[]; // добавили это
  specs?: Partial<{
    abv: string;
    allergens: string;
    brand: string;
    country: string;
    gtin: string;
    ingredients: string;
    pack_size_l: string;
    pack_type: string;
    pairing: string;
    shelf_life_days: string;
    ibu: string;
    fg: string;
  }>;
  shopify?: Partial<{
    "beer-style": string;
    "package-type": string;
  }>;
  rating?: number;
  reviewCount?: number;
};

export function flattenMetafields(p: ProductNode): FlattenedProduct {
  const grouped: Record<string, Record<string, string>> = {};
  for (const mf of p.metafields ?? []) {
    if (!mf?.value) continue;
    (grouped[mf.namespace] ??= {})[mf.key] = mf.value;
  }

  // Извлекаем handle коллекций
  const collections = p.collections?.edges.map((e) => e.node.handle) || [];

  return {
    ...p,
    collections, // добавили это
    specs: grouped["specs"],
    shopify: grouped["shopify"],
  };
}
