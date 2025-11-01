import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

type Props = {
  title: string;
  browseAll: string;
  cta: string;
  names: { beer: string; cider: string; snacks: string };
  alts: { beer: string; cider: string; snacks: string };
  lang: Locale;
};

export default function ShopCategory({
  title,
  browseAll,
  cta,
  names,
  alts,
  lang,
}: Props) {
  const cards = [
    {
      key: "beer" as const,
      href: `/${lang}/shop?category=beer`,
      img: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-featured-category.jpg",
      alt: alts.beer,
      big: true,
    },
    {
      key: "cider" as const,
      href: `/${lang}/shop?category=cider`,
      img: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-01.jpg",
      alt: alts.cider,
    },
    {
      key: "snacks" as const,
      href: `/${lang}/shop?category=snacks`,
      img: "https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-03-category-02.jpg",
      alt: alts.snacks,
    },
  ];

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <Link
            href={`/${lang}/shop`}
            className="hidden text-sm font-semibold text-indigo-600 hover:text-indigo-500 sm:block"
          >
            {browseAll} <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
          {cards.map((c) => (
            <div
              key={c.key}
              className={[
                "group relative overflow-hidden rounded-lg",
                c.big
                  ? "aspect-2/1 sm:row-span-2 sm:aspect-square"
                  : "aspect-2/1 sm:aspect-auto",
              ].join(" ")}
            >
              <Image
                width={640}
                height={640}
                alt={c.alt}
                src={c.img}
                className="absolute size-full object-cover group-hover:opacity-75"
                priority={c.big}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50"
              />
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <h3 className="font-semibold text-white">
                    <Link href={c.href}>
                      <span className="absolute inset-0" />
                      {names[c.key]}
                    </Link>
                  </h3>
                  <p aria-hidden="true" className="mt-1 text-sm text-white">
                    {cta}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href={`/${lang}/shop`}
            className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
          >
            {browseAll} <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
