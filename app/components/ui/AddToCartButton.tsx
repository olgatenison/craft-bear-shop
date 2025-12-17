// app/components/ui/AddToCartButton.tsx
"use client";

import { useCart } from "@/app/context/CartContext";
import type { FlattenedProduct } from "@/app/data/mappers";
import QuantityCounter from "./QuantityCounter";

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

type AddToCartButtonProps = {
  product: FlattenedProduct;
  addToCart: string;
  className?: string;
};

type VariantSelectedOption = { name: string; value: string };

type VariantNode = {
  id: string;
  title?: string;
  price?: { amount: string; currencyCode: string };
  selectedOptions?: VariantSelectedOption[];
};

type VariantEdge = { node: VariantNode };
type VariantConnection = { edges: VariantEdge[] };

type ProductWithVariants = FlattenedProduct & {
  variants?: VariantConnection | VariantNode[];
};

function isVariantConnection(v: unknown): v is VariantConnection {
  return (
    typeof v === "object" &&
    v !== null &&
    "edges" in v &&
    Array.isArray((v as { edges?: unknown }).edges)
  );
}

function getVariantNodes(product: ProductWithVariants): VariantNode[] {
  const v = product.variants;

  if (!v) return [];

  // variants як масив
  if (Array.isArray(v)) return v;

  // variants як GraphQL connection
  if (isVariantConnection(v)) return v.edges.map((e) => e.node);

  return [];
}

export default function AddToCartButton({
  product,
  addToCart,
  className,
}: AddToCartButtonProps) {
  const { items, addToCart: addItemToCart } = useCart();

  const cartItem = items.find((item) => item.id === product.variantId);

  const handleAddToCart = () => {
    const variants = getVariantNodes(product as ProductWithVariants);
    const selected = variants.find((v) => v.id === product.variantId);

    // ✅ ціна саме вибраного варіанта (0.5 або 1)
    const unitPrice = Number(
      selected?.price?.amount ?? product.priceRange.minVariantPrice.amount
    );

    // ✅ розмір/обʼєм: спочатку беремо volume з варіанта, інакше pack_size_l
    const volumeOpt = selected?.selectedOptions?.find(
      (o) => o.name.toLowerCase() === "volume"
    )?.value;

    const size = volumeOpt
      ? `${volumeOpt} L`
      : product.specs?.pack_size_l
      ? `${product.specs.pack_size_l} L`
      : undefined;

    addItemToCart({
      id: product.variantId, // variant gid
      name: product.title,
      handle: product.handle, // ✅ для лінка з корзини на товар
      price: unitPrice,
      imageSrc:
        product.images?.edges?.[0]?.node.url ??
        product.featuredImage?.url ??
        "",
      imageAlt: product.title,
      country: product.specs?.country,
      size,
      abv: product.specs?.abv,
    });
  };

  if (cartItem) {
    return (
      <QuantityCounter
        productId={product.variantId}
        quantity={cartItem.quantity}
      />
    );
  }

  const defaultClasses =
    "inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-900 hover:bg-yellow-500 hover:border-yellow-600 sm:w-auto lg:w-full duration-300";

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className={classNames(defaultClasses, className)}
    >
      {addToCart}
    </button>
  );
}
