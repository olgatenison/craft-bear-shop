import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

const products = [
  {
    id: 1,
    name: "Zip Tote Basket",
    color: "White and black",
    href: "#",
    imageSrc: "/category/Steam_Beer_700x700px.webp",
    imageAlt:
      "Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.",
    price: "$140",
    rating: 4,
    reviewCount: 87,
  },
  {
    id: 2,
    name: "Zip High Wall Tote",
    color: "White and blue",
    href: "#",
    imageSrc: "/category/Steam_Beer_700x700px.webp",
    imageAlt:
      "Front of zip tote bag with white canvas, blue canvas straps and handle, and front zipper pocket.",
    price: "$150",
    rating: 5,
    reviewCount: 112,
  },
  {
    id: 3,
    name: "Halfsize Tote",
    color: "Clay",
    href: "#",
    imageSrc: "/category/Steam_Beer_700x700px.webp",
    imageAlt:
      "Front of tote with monochrome natural canvas body, straps, roll top, and handles.",
    price: "$210",
    rating: 3,
    reviewCount: 41,
  },
  {
    id: 4,
    name: "High Wall Tote",
    color: "Black and orange",
    href: "#",
    imageSrc:
      "/category/stoelzle-lausitz-bierglaeser-glass-mug-full-beer-foam.webp",
    imageAlt:
      "Front of zip tote bag with black canvas, black handles, and orange drawstring top.",
    price: "$210",
    rating: 4,
    reviewCount: 63,
  },
];

type AllProductsProps = {
  title: string;
  stars: string;
  reviews: string;
  add: string;
};

export default function AllProducts({
  title,
  stars,
  reviews,
  add,
}: AllProductsProps) {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-6  pb-26 sm:px-6 lg:max-w-7xl lg:px-8 ">
        <h2 className="text-2xl tracking-tight text-white">{title}</h2>

        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id}>
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-300">
                  <Image
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>

                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-yellow-400">
                      <Link href={product.href}>{product.name}</Link>
                    </h3>
                    {/* <p className="mt-1 text-base text-gray-400">
                      {product.color}
                    </p> */}
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {product.price}
                  </p>
                </div>

                <div className="mt-3 flex flex-col ">
                  <span className="sr-only">
                    {product.rating} {stars}
                  </span>
                  <div className="flex ">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <StarIcon
                        key={i}
                        aria-hidden="true"
                        className={classNames(
                          product.rating > i ? "text-white" : "text-gray-500",
                          "size-3 shrink-0"
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.reviewCount} {reviews}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={product.href}
                  className="relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  {add}
                  <span className="sr-only">, {product.name}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
