// app/data/types.ts
export interface ProductVariantNode {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  } | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;
}

export interface ProductNode {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  images?: {
    edges: Array<{
      node: {
        url: string;
        altText?: string;
      };
    }>;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  // 👇 ДОБАВЬ ЭТО
  variants?: {
    edges: Array<{
      node: {
        id: string; // GID варианта
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        } | null;
        availableForSale: boolean;
        quantityAvailable?: number | null;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
      };
    }>;
  };

  collections?: {
    edges: Array<{
      node: {
        handle: string;
        title?: string;
      };
    }>;
  };
  metafields?: Metafield[];
  translations?: Array<{ key: string; value: string }>;
}

export interface Metafield {
  namespace: string;
  key: string;
  type: string;
  value: string;
  reference?: {
    handle?: string;
    fields?: Array<{
      key: string;
      value: string;
    }>;
  };
  references?: {
    edges: Array<{
      node: {
        handle?: string;
        fields?: Array<{
          key: string;
          value: string;
        }>;
      };
    }>;
  };
}

// Response types
export interface ProductsAllResponse {
  products: {
    edges: Array<{
      node: ProductNode;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

export interface ProductsByCollectionResponse {
  collection?: {
    id: string;
    title: string;
    products: {
      edges: Array<{
        node: ProductNode;
        cursor: string;
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string;
      };
    };
  };
}

export interface ProductByHandleResponse {
  product: ProductNode | null;
}

export interface ShopifyPage {
  id: string;
  title: string;
  body: string; // HTML из Shopify
}
