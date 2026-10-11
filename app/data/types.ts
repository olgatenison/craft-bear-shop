// app/data/types.ts

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  url: string;
  altText?: string | null;
}

export interface ProductVariantSelectedOption {
  name: string;
  value: string;
}

export interface ProductVariantNode {
  id: string;
  title: string;

  price: Money;

  compareAtPrice?: Money | null;

  availableForSale: boolean;

  quantityAvailable?: number | null;

  selectedOptions: ProductVariantSelectedOption[];

  // Картинка конкретного варианта
  image?: ProductImage | null;
}

export interface ProductVariantEdge {
  node: ProductVariantNode;
}

export interface ProductVariantConnection {
  edges: ProductVariantEdge[];
}

export interface ProductNode {
  id: string;
  title: string;
  handle: string;

  descriptionHtml?: string;

  featuredImage?: ProductImage | null;

  images?: {
    edges: Array<{
      node: ProductImage;
    }>;
  };

  priceRange: {
    minVariantPrice: Money;
  };

  variants?: ProductVariantConnection;

  collections?: {
    edges: Array<{
      node: {
        handle: string;
        title?: string;
      };
    }>;
  };

  metafields?: Metafield[];

  translations?: Array<{
    key: string;
    value: string;
  }>;
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
  body: string;
}
