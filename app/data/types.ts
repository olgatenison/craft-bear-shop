// app/data/types.ts
export type Money = { amount: string; currencyCode: string };

export type Metafield = {
  namespace: string;
  key: string;
  type: string;
  value: string | null;
};

export type ProductNode = {
  id: string;
  title: string;
  handle: string;
  updatedAt?: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange: { minVariantPrice: Money };
  metafields: Metafield[];
  collections?: {
    edges: {
      node: {
        handle: string;
        title: string;
      };
    }[];
  };
};

export type ProductsAllResponse = {
  products: {
    edges: { cursor: string; node: ProductNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
};

export type ProductsByCollectionResponse = {
  collection: {
    id: string;
    title: string;
    products: {
      edges: { cursor: string; node: ProductNode }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
};
