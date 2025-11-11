import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";

import {
  CurrencyDollarIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";

const product = {
  name: "Basic Tee",
  price: "$35",
  GTIN: "djfhvjhsvf",
  rating: 3.9,
  reviewCount: 512,
  href: "#",
  breadcrumbs: [
    { id: 1, name: "Women", href: "#" },
    { id: 2, name: "Clothing", href: "#" },
  ],
  images: [
    {
      id: 1,
      imageSrc: "/category/ananas.png",
      imageAlt: "Back of women's Basic Tee in black.",
      primary: true,
    },
    {
      id: 2,
      imageSrc: "/category/Steam_Beer_700x700px.webp",
      imageAlt: "Back of women's Basic Tee in black.",
      primary: true,
    },
  ],
  country: "Poland",
  abv: "4.7%",
  packSize: "0.5",
  allergens: "contains gluten",
  ingredients:
    "water, barley malt, hops, pineapple juice/concentrate, sugar or glucose-fructose syrup, pineapple flavoring",
  description: `
    <p>The Basic tee is an honest new take on a classic. The tee uses super soft, pre-shrunk cotton for true comfort and a dependable fit. They are hand cut and sewn locally, with a special dye technique that gives each tee it's own look.</p>
    <p>Looking to stock your closet? The Basic tee also comes in a 3-pack or 5-pack at a bundle discount.</p>
  `,
  details: [
    "Only the best materials",
    "Ethically and locally made",
    "Pre-washed and pre-shrunk",
    "Machine wash cold with similar colors",
  ],
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductOverviews() {
  return (
    <div>
      <div className="pb-16 pt-6 sm:pb-24">
        {/* <nav
          aria-label="Breadcrumb"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <ol role="list" className="flex items-center space-x-4">
            {product.breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.id}>
                <div className="flex items-center">
                  <a
                    href={breadcrumb.href}
                    className="mr-4 text-sm font-medium text-gray-900"
                  >
                    {breadcrumb.name}
                  </a>
                  <svg
                    viewBox="0 0 6 20"
                    aria-hidden="true"
                    className="h-5 w-auto text-gray-300"
                  >
                    <path
                      d="M4.878 4.34H3.551L.27 16.532h1.327l3.281-12.19z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </li>
            ))}
            <li className="text-sm">
              <a
                href={product.href}
                aria-current="page"
                className="font-medium text-gray-500 hover:text-gray-600"
              >
                {product.name}
              </a>
            </li>
          </ol>
        </nav> */}

        <div className="mx-auto mt-8 max-w-2xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
            {/* title and price */}
            <div className="lg:col-span-5 lg:col-start-8">
              <div className="flex justify-between items-baseline">
                <h1 className="text-4xl tracking-tight font-semibold text-yellow-400">
                  {product.name}
                  <span className="ml-3 ">{product.packSize} L</span>
                </h1>

                <div className="flex flex-col items-end text-right">
                  <span className="text-2xl font-medium text-white">
                    {product.price}
                  </span>
                  <span className="text-base/8 text-gray-300">грн за 1 шт</span>
                </div>
              </div>

              {/* Product country and avd */}
              <div className="mt-5 w-full flex items-baseline gap-2">
                <span className="text-lg/8 text-white font-semibold whitespace-nowrap">
                  Avb:
                </span>
                <span className="text-base/8 text-gray-300">{product.abv}</span>
              </div>
              <div className="w-full flex items-baseline gap-2">
                <span className="text-lg/8 text-white font-semibold whitespace-nowrap">
                  Country:
                </span>
                <span className="text-base/8 text-gray-300">
                  {product.country}
                </span>
              </div>
              {/* Reviews */}
              <div className="mt-4">
                <h2 className="sr-only">Reviews</h2>
                <div className="flex items-center">
                  <div className="mr-2 flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={classNames(
                          product.rating > rating
                            ? "text-yellow-400"
                            : "text-gray-500",
                          "size-5 shrink-0"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.rating}
                    <span className="sr-only"> out of 5 stars</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Image gallery */}
            <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:-mt-6">
              <h2 className="sr-only">Images</h2>

              <div className="group grid grid-cols-1 lg:grid-cols-2 lg:gap-8 p-6">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className={classNames(
                      image.primary
                        ? "lg:col-span-2 lg:row-span-2"
                        : "hidden lg:block",
                      // квадратная карточка со сглаженной анимацией фона
                      "relative aspect-square w-full overflow-hidden rounded-lg bg-stone-200 transition-colors duration-300 "
                    )}
                  >
                    <Image
                      alt={image.imageAlt}
                      src={image.imageSrc}
                      fill
                      sizes="(min-width:1024px) 50vw, 100vw"
                      className="object-contain object-center"
                      priority={image.primary}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* button  and right side under*/}
            <div className="mt-16 lg:col-span-5">
              <form>
                <button
                  type="submit"
                  className="relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
                >
                  Add to cart
                </button>
              </form>

              {/* Product Description*/}
              <div className="mt-10">
                <h2 className="mx-auto mt-6 max-w-lg  text-lg/8 text-white font-semibold">
                  Description
                </h2>

                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="mx-auto mt-6 max-w-xl text-pretty text-base/8 text-gray-300 "
                />
              </div>
              {/* Tasted best with */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="mx-auto mt-6 max-w-lg text-pretty text-lg/8 text-white font-semibold">
                  Tasted best with
                </h2>

                <div className="mt-4">
                  <ul
                    role="list"
                    className="list-disc space-y-1 pl-5 text-sm/6 text-gray-300 marker:text-gray-300"
                  >
                    {product.details.map((item) => (
                      <li key={item} className="pl-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Allergens */}
              <div className="w-full flex items-baseline gap-2 mt-6">
                <span className="text-lg/8 text-white font-semibold whitespace-nowrap">
                  Allergens:
                </span>
                <span className="text-base/8 text-gray-300">
                  {product.allergens}
                </span>
              </div>
              {/* Ingredients */}
              <div className="w-full flex items-baseline gap-2 mt-6">
                <span className="text-lg/8 text-white font-semibold whitespace-nowrap">
                  Ingridients:
                </span>
                <span className="text-base/8 text-gray-300">
                  {product.ingredients}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
