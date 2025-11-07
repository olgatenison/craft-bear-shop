import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import { WineOff } from "lucide-react";
import Link from "next/link";

const classNames = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

const products = [
  {
    id: 1,
    name: "Zip Tote Basket",
    color: "White and black",
    href: "#",
    imageSrc: "/category/czekolada.png",
    imageAlt:
      "Front of zip tote bag with white canvas, black canvas straps and handle, and black zipper pulls.",
    price: "$140",
    rating: 4,
    reviewCount: 87,
    abv: 4.7,
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
    abv: 4.7,
  },
  {
    id: 3,
    name: "Halfsize Tote",
    color: "Clay",
    href: "#",
    imageSrc: "/category/ananas.png",
    imageAlt:
      "Front of tote with monochrome natural canvas body, straps, roll top, and handles.",
    price: "$210",
    rating: 3,
    reviewCount: 41,
    abv: 4.7,
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
    abv: 0,
  },
];

type TrendingProductsProps = {
  title: string;
  stars: string;
  reviews: string;
  add: string;
  alcohol: string;
};

export default function TrendingProducts({
  title,
  stars,
  reviews,
  add,
  alcohol,
}: TrendingProductsProps) {
  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 pt-6  pb-26 sm:px-6 lg:max-w-7xl lg:px-8 ">
        <h2 className="text-2xl tracking-tight text-white">{title}</h2>

        <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-stone-700 transition-colors duration-300 group-hover:bg-white">
                  <Image
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    fill
                    sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                    className="object-contain transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-105 p-3"
                    priority={false}
                  />{" "}
                  {Number(product.abv) === 0 && (
                    <span
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-1 text-[10px] font-semibold uppercase text-white shadow-lg ring-1 ring-black/10"
                      aria-label="Alcohol-free"
                    >
                      <WineOff className="h-3.5 w-3.5" aria-hidden="true" />
                      {alcohol}
                      <span className="sr-only">{alcohol}</span>
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-white">
                      <Link href={product.href} className="focus:outline-none">
                        {product.name}
                        <span
                          className="absolute inset-0 rounded-lg"
                          aria-hidden="true"
                        />
                      </Link>
                    </h3>
                    <p>{product.abv} %</p>
                  </div>
                  <p className="text-lg font-semibold text-white">
                    {product.price}
                  </p>
                </div>

                <div className="mt-3 flex flex-col">
                  <span className="sr-only">
                    {product.rating} {stars}
                  </span>
                  <div className="flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <StarIcon
                        key={i}
                        aria-hidden="true"
                        className={classNames(
                          product.rating > i
                            ? "text-yellow-400"
                            : "text-gray-500",
                          "size-5 shrink-0"
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
                  className="relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
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
