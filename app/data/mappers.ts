import type { ProductNode, Metafield } from "./types";

export type FlattenedProduct = Omit<
  ProductNode,
  "metafields" | "collections" | "translations"
> & {
  collections: string[];
  variantId: string;

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
    volume: string;
    box_number: string;
    bottle_in_box: string;

    // Wholesale
    wholesale_price: string;
    wholesale_unit: string;
    wholesale_quantity_per_box: string;

    // Kegs
    keg_volume_liters: string;
    keg_material: string;
  }>;

  shopify?: Partial<{
    "beer-style": string;
    "package-type": string;
  }>;

  trending?: boolean;
  rating?: number;
  reviewCount?: number;
};

function extractMetafieldValue(mf: Metafield): string | null {
  // Список reference-метаобъектов
  if (
    mf.type.includes("list.") &&
    mf.type.includes("reference") &&
    mf.references?.edges
  ) {
    const names: string[] = [];

    for (const edge of mf.references.edges) {
      const metaobject = edge.node;

      if (!metaobject?.fields) {
        continue;
      }

      const nameField = metaobject.fields.find(
        (field) =>
          field.key === "name" ||
          field.key === "title" ||
          field.key === "value",
      );

      if (nameField?.value) {
        names.push(nameField.value);
      } else if (metaobject.handle) {
        names.push(metaobject.handle);
      }
    }

    return names.length > 0 ? names.join(", ") : null;
  }

  // Одиночный reference
  if (
    mf.type.includes("reference") &&
    !mf.type.includes("list.") &&
    mf.reference?.fields
  ) {
    const nameField = mf.reference.fields.find(
      (field) =>
        field.key === "name" || field.key === "title" || field.key === "value",
    );

    if (nameField?.value) {
      return nameField.value;
    }

    if (mf.reference.handle) {
      return mf.reference.handle;
    }

    return null;
  }

  // Обычное значение
  return mf.value;
}

/**
 * Преобразует ProductNode в плоскую структуру FlattenedProduct
 */
export function flattenMetafields(p: ProductNode): FlattenedProduct {
  const grouped: Record<string, Record<string, string>> = {};

  if (p.metafields) {
    for (const mf of p.metafields) {
      if (!mf) {
        continue;
      }

      const value = extractMetafieldValue(mf);

      if (!value) {
        continue;
      }

      if (!grouped[mf.namespace]) {
        grouped[mf.namespace] = {};
      }

      grouped[mf.namespace][mf.key] = value;
    }
  }

  const collections =
    p.collections?.edges?.map((edge) => edge.node.handle) ?? [];

  type ProductBase = Omit<
    ProductNode,
    "metafields" | "collections" | "translations"
  >;

  const base: ProductBase = {
    ...(p as ProductBase),
  };

  const marketing = grouped["marketing"] ?? {};

  /*
   * Первый variant оставляем дефолтным.
   *
   * Для beer-boxes конкретный Box variant
   * выбирается отдельно в UI.
   *
   * Для kegs конкретный 30 L variant
   * тоже выбирается отдельно в UI.
   */
  const firstVariant = p.variants?.edges?.[0]?.node;

  const variantId = firstVariant?.id ?? p.id;

  return {
    ...base,

    collections,

    variantId,

    // Все метаполя namespace "specs",
    // включая новые wholesale и keg поля
    specs: grouped["specs"] as FlattenedProduct["specs"],

    shopify: grouped["shopify"] as FlattenedProduct["shopify"],

    trending: marketing["trending"] === "true" || marketing["trending"] === "1",
  };
}

/**
 * Утилита для получения одного metafield
 */
export function getMetafieldValue(
  product: FlattenedProduct,
  namespace: "specs" | "shopify",
  key: string,
): string | undefined {
  const nsData = product[namespace];

  if (!nsData) {
    return undefined;
  }

  return nsData[key as keyof typeof nsData];
}

export function getBeerStyle(product: FlattenedProduct): string | undefined {
  return product.shopify?.["beer-style"];
}

/**
 * Возвращает характеристики продукта
 */
export function getProductSpecs(product: FlattenedProduct): Array<{
  label: string;
  value: string;
}> {
  const specs: Array<{
    label: string;
    value: string;
  }> = [];

  if (product.specs) {
    const specsMap: Record<string, string> = {
      abv: "ABV",
      ibu: "IBU",
      fg: "FG",

      pack_size_l: "Volume",

      volume: "Weight (g)",

      box_number: "Box number",

      bottle_in_box: "Bottle in box",

      // Wholesale
      wholesale_price: "Wholesale price",
      wholesale_unit: "Wholesale unit",
      wholesale_quantity_per_box: "Quantity per box",

      // Kegs
      keg_volume_liters: "Keg volume (L)",
      keg_material: "Keg material",

      country: "Country",

      brand: "Brand",

      allergens: "Allergens",

      pairing: "Pairing",

      ingredients: "Ingredients",
    };

    for (const [key, label] of Object.entries(specsMap)) {
      const value = product.specs[key as keyof typeof product.specs];

      if (value) {
        specs.push({
          label,
          value,
        });
      }
    }
  }

  const beerStyle = getBeerStyle(product);

  if (beerStyle) {
    specs.unshift({
      label: "Style",
      value: beerStyle,
    });
  }

  return specs;
}

/**
 * Преобразует массив Shopify ProductNode
 * в массив FlattenedProduct
 */
export function flattenProducts(products: ProductNode[]): FlattenedProduct[] {
  return products.map((product) => flattenMetafields(product));
}
