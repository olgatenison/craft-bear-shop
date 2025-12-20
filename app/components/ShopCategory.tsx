import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";
import RowLink from "./ui/RowLink";

type CategoryKey = "draft" | "beer" | "cider" | "snacks";

type Props = {
  title: string;
  browseAll: string;

  names: Record<CategoryKey, string>;
  alts: Record<CategoryKey, string>;
  lang: Locale;
};

export default function ShopCategory({
  title,
  browseAll,
  names,
  alts,
  lang,
}: Props) {
  const cards = [
    {
      key: "beer" as const,
      href: `/${lang}/shop?category=beer`,
      img: "/category/tabs1.jpg",
      alt: alts.beer,
      big: true,
    },
    {
      key: "cider" as const,
      href: `/${lang}/shop?category=cider`,
      img: "/category/photo_2025-11-06_21-25-42.jpg",
      alt: alts.cider,
    },
    {
      key: "snacks" as const,
      href: `/${lang}/shop?category=snacks`,
      img: "/category/photo_2025-11-02_14-55-04.jpg",
      alt: alts.snacks,
    },
    {
      key: "draft" as const,
      href: `/${lang}/shop?category=draft-beer`,
      img: "/category/fresh-light-beer-mug.jpg",
      alt: alts.draft,
      wide: true,
    },
  ];

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 sm:py-24 lg:px-8">
        <div className="sm:flex sm:items-baseline sm:justify-between">
          <h2 className="text-2xl tracking-tight text-white">{title}</h2>
          <RowLink href={`/${lang}/shop`} label={browseAll} />
        </div>

        {/* 1 колонка на мобилке, 2 колонки на sm+ */}
        <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 lg:gap-8">
          {cards.map((c) => {
            const isBig = "big" in c && c.big;
            const isWide = "wide" in c && c.wide;

            return (
              <Link
                key={c.key}
                href={c.href}
                aria-label={names[c.key]}
                className={[
                  "group relative block overflow-hidden rounded-lg transition-all duration-300",
                  // Большая слева (на sm+)
                  isBig ? "aspect-2/1 sm:row-span-2 sm:aspect-square" : "",
                  // Обычные справа
                  !isBig && !isWide
                    ? "aspect-2/1 sm:aspect-auto sm:min-h-[220px]"
                    : "",
                  // Широкая снизу на lg+ (col-span-2)
                  isWide
                    ? "aspect-2/1 sm:min-h-60 lg:col-span-2 lg:aspect-5/2"
                    : "",
                ].join(" ")}
              >
                <Image
                  width={1200}
                  height={800}
                  alt={c.alt}
                  src={c.img}
                  className="absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:opacity-45"
                  priority={isBig}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-b from-transparent to-black opacity-50"
                />

                <div className="absolute inset-0 flex items-end p-6">
                  <h3
                    className="relative font-extrabold uppercase leading-none
                      text-transparent transition-all duration-300 group-hover:text-yellow-500
                      text-5xl sm:text-6xl lg:text-6xl
                      [-webkit-text-stroke:2px_white] [paint-order:stroke_fill]"
                  >
                    {names[c.key]}
                  </h3>
                </div>

                <span className="sr-only">{`Перейти до: ${names[c.key]}`}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
