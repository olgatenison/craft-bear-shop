// app/data/repo.ts
import { shopifyFetch } from "../lib/shopify/client";
import {
  PRODUCTS_ALL_WITH_METAFIELDS,
  PRODUCTS_BY_COLLECTION,
} from "../lib/shopify/queries/products.gql";
import {
  ProductsAllResponse,
  ProductNode,
  ProductsByCollectionResponse,
} from "./types";
import { flattenMetafields, FlattenedProduct } from "./mappers";

export async function fetchAllProducts(): Promise<ProductNode[]> {
  const pageSize = 250;
  let after: string | null = null;
  const acc: ProductNode[] = [];

  do {
    const data: ProductsAllResponse = await shopifyFetch<ProductsAllResponse>(
      PRODUCTS_ALL_WITH_METAFIELDS,
      { first: pageSize, after },
      60
    );
    acc.push(...data.products.edges.map((e: { node: ProductNode }) => e.node));
    after = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
  } while (after);

  return acc;
}

export async function fetchAllProductsFlattened(): Promise<FlattenedProduct[]> {
  const nodes = await fetchAllProducts();
  return nodes.map(flattenMetafields);
}

export async function fetchCollectionProducts(
  handle: string
): Promise<ProductNode[]> {
  const pageSize = 250;
  let after: string | null = null;
  const acc: ProductNode[] = [];

  do {
    const data: ProductsByCollectionResponse =
      await shopifyFetch<ProductsByCollectionResponse>(
        PRODUCTS_BY_COLLECTION,
        { handle, first: pageSize, after },
        60
      );

    const block = data.collection?.products;
    if (!block) break;

    acc.push(...block.edges.map((e: { node: ProductNode }) => e.node));
    after = block.pageInfo.hasNextPage ? block.pageInfo.endCursor : null;
  } while (after);

  return acc;
}

export async function fetchCollectionProductsFlattened(
  handle: string
): Promise<FlattenedProduct[]> {
  const nodes = await fetchCollectionProducts(handle);
  return nodes.map(flattenMetafields);
}

// один продукт

export async function fetchProductByHandleFlattened(
  handle: string
): Promise<FlattenedProduct | null> {
  if (!handle) return null;
  const data = await shopifyFetch<ProductByHandleResponse>(
    PRODUCT_BY_HANDLE,
    { handle },
    60
  );
  if (!data.product) return null;
  return flattenMetafields(data.product);
}
