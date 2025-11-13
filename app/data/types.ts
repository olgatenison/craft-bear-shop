// app/data/types.ts
export type Money = { amount: string; currencyCode: string };

export type MetaobjectField = {
  key: string;
  value: string;
  type?: string;
  references?: {
    edges: Array<{
      node: {
        handle?: string;
        fields?: MetaobjectField[];
      };
    }>;
  };
};

export type MetaobjectReference = {
  id?: string;
  handle?: string;
  type?: string;
  fields?: MetaobjectField[];
};

export type Metafield = {
  namespace: string;
  key: string;
  type: string;
  value: string | null;
  reference?: MetaobjectReference | null;
  references?: {
    edges: Array<{
      node: MetaobjectReference;
    }>;
  } | null;
};

export type ProductNode = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string;
  updatedAt?: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  images: {
    edges: {
      node: {
        url: string;
        altText: string | null;
      };
    }[];
  };
  priceRange: { minVariantPrice: Money };
  metafields: Metafield[];
  collections?: {
    edges: {
      node: {
        handle: string;
        title?: string;
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

export interface ProductByHandleResponse {
  product: ProductNode | null;
}
