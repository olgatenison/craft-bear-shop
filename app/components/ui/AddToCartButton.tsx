// app/components/ui/AddToCartButton.tsx
"use client";
import { useCart } from "@/app/context/CartContext";
import { FlattenedProduct } from "@/app/data/mappers";
import QuantityCounter from "./QuantityCounter";

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

type AddToCartButtonProps = {
  product: FlattenedProduct;
  addToCart: string;
  className?: string;
};

export default function AddToCartButton({
  product,
  addToCart,
  className,
}: AddToCartButtonProps) {
  const { items, addToCart: addItemToCart } = useCart();

  const cartItem = items.find((item) => item.id === product.variantId);

  const handleAddToCart = () => {
    addItemToCart({
      id: product.variantId,
      name: product.title,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      imageSrc:
        product.images?.edges?.[0]?.node.url ??
        product.featuredImage?.url ??
        "",
      imageAlt: product.title,
      country: product.specs?.country,
      size: product.specs?.pack_size_l
        ? `${product.specs.pack_size_l} L`
        : undefined,
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
