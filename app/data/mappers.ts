// app/data/mappers.ts
import type { ProductNode, Metafield } from "./types";

export type FlattenedProduct = Omit<
  ProductNode,
  "metafields" | "collections"
> & {
  collections: string[];
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

// ✅ Функция для извлечения значения из metafield
function extractMetafieldValue(mf: Metafield): string | null {
  // Если это reference (beer-style), берем значение из fields
  if (mf.type.includes("reference") && mf.reference?.fields) {
    // Ищем поле 'name' или 'value' в metaobject
    const nameField = mf.reference.fields.find(
      (f) => f.key === "name" || f.key === "value" || f.key === "title"
    );
    return nameField?.value || mf.reference.handle || null;
  }

  // Для обычных полей возвращаем value
  return mf.value;
}

export function flattenMetafields(p: ProductNode): FlattenedProduct {
  const grouped: Record<string, Record<string, string>> = {};

  for (const mf of p.metafields ?? []) {
    if (!mf) continue;

    const value = extractMetafieldValue(mf);
    if (!value) continue;

    (grouped[mf.namespace] ??= {})[mf.key] = value;
  }

  const collections = p.collections?.edges.map((e) => e.node.handle) || [];

  return {
    ...p,
    collections,
    specs: grouped["specs"],
    shopify: grouped["shopify"],
  };
}
