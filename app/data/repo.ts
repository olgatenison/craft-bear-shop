// app/data/repo.ts

import { shopifyFetchWithLocale } from "../lib/shopify/client";

import {
  PRODUCTS_ALL_WITH_METAFIELDS,
  PRODUCTS_BY_COLLECTION,
  PRODUCT_BY_HANDLE,
  PRODUCT_BY_ID,
} from "../lib/shopify/queries/products.gql";

import { PAGE_BY_HANDLE } from "../lib/shopify/queries/pages.gql";

import type {
  ProductsAllResponse,
  ProductNode,
  ProductsByCollectionResponse,
  ProductByHandleResponse,
  ShopifyPage,
} from "./types";

import { flattenMetafields, flattenProducts } from "./mappers";

import type { FlattenedProduct } from "./mappers";

import type { Locale } from "../lib/locale";

type Edge<T> = {
  cursor?: string | null;
  node: T;
};

/**
 * --------------------------------------------------
 * ВСЕ ПРОДУКТЫ
 * --------------------------------------------------
 */
export async function fetchAllProducts(
  locale: Locale = "en",
): Promise<ProductNode[]> {
  const pageSize = 250;

  let after: string | null = null;

  const acc: ProductNode[] = [];

  do {
    const response: ProductsAllResponse =
      await shopifyFetchWithLocale<ProductsAllResponse>(
        PRODUCTS_ALL_WITH_METAFIELDS,
        {
          first: pageSize,
          after,
        },
        locale,
        60,
      );

    const edges = response.products.edges as Array<Edge<ProductNode>>;

    acc.push(...edges.map((edge) => edge.node));

    after = response.products.pageInfo.hasNextPage
      ? response.products.pageInfo.endCursor
      : null;
  } while (after);

  return acc;
}

export async function fetchAllProductsFlattened(
  locale: Locale = "en",
): Promise<FlattenedProduct[]> {
  const nodes = await fetchAllProducts(locale);

  return flattenProducts(nodes);
}

/**
 * --------------------------------------------------
 * ПРОДУКТЫ ПО КОЛЛЕКЦИИ
 * --------------------------------------------------
 */
export async function fetchCollectionProducts(
  handle: string,
  locale: Locale = "en",
): Promise<ProductNode[]> {
  const pageSize = 250;

  let after: string | null = null;

  const acc: ProductNode[] = [];

  do {
    const response = await shopifyFetchWithLocale<ProductsByCollectionResponse>(
      PRODUCTS_BY_COLLECTION,
      {
        handle,
        first: pageSize,
        after,
      },
      locale,
      60,
    );

    const block = response.collection?.products as
      | {
          edges: Array<Edge<ProductNode>>;

          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        }
      | undefined;

    if (!block) {
      break;
    }

    acc.push(...block.edges.map((edge) => edge.node));

    after = block.pageInfo.hasNextPage ? block.pageInfo.endCursor : null;
  } while (after);

  return acc;
}

export async function fetchCollectionProductsFlattened(
  handle: string,
  locale: Locale = "en",
): Promise<FlattenedProduct[]> {
  const nodes = await fetchCollectionProducts(handle, locale);

  return flattenProducts(nodes);
}

/**
 * --------------------------------------------------
 * ОДИН ПРОДУКТ ПО HANDLE
 * --------------------------------------------------
 */
export async function fetchProductByHandleFlattened(
  handle: string,
  locale: Locale = "en",
): Promise<FlattenedProduct | null> {
  if (!handle) {
    return null;
  }

  const response = await shopifyFetchWithLocale<ProductByHandleResponse>(
    PRODUCT_BY_HANDLE,
    {
      handle,
    },
    locale,
    60,
  );

  if (!response.product) {
    return null;
  }

  return flattenMetafields(response.product);
}

/**
 * --------------------------------------------------
 * SHOPIFY PAGE ПО HANDLE
 * --------------------------------------------------
 */
export async function fetchPageByHandle(
  handle: string,
  locale: Locale = "en",
): Promise<ShopifyPage | null> {
  if (!handle) {
    return null;
  }

  const response = await shopifyFetchWithLocale<{
    page: ShopifyPage | null;
  }>(
    PAGE_BY_HANDLE,
    {
      handle,
    },
    locale,
    60,
  );

  return response.page;
}

/**
 * --------------------------------------------------
 * ОДИН ПРОДУКТ ПО SHOPIFY NUMERIC ID
 * --------------------------------------------------
 */
export async function fetchProductByShopifyNumericIdFlattened(
  numericId: string,
  locale: Locale = "en",
): Promise<FlattenedProduct | null> {
  if (!numericId) {
    return null;
  }

  const globalId = `gid://shopify/Product/${numericId}`;

  const response = await shopifyFetchWithLocale<ProductByHandleResponse>(
    PRODUCT_BY_ID,
    {
      id: globalId,
    },
    locale,
    60,
  );

  if (!response.product) {
    return null;
  }

  return flattenMetafields(response.product);
}
