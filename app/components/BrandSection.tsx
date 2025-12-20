// app/components/BrandSection.tsx
import Image from "next/image";
import type { Locale } from "@/app/lib/locale";
import { getBrandLogos } from "@/app/lib/shopify/brandLogos";

// const text =
//   "Нам доверяют команды по всему миру — от стартапов до лидеров рынка.";

export default async function BrandSection({ lang }: { lang: Locale }) {
  const items = await getBrandLogos(lang);
  if (!items.length) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mx-auto my-10 flex max-w-lg flex-wrap items-center justify-center gap-x-8 gap-y-12 sm:max-w-xl sm:gap-x-10 sm:gap-y-14 lg:max-w-7xl">
          {items.map((partner, idx) => (
            <Image
              key={partner.id}
              alt={partner.name}
              src={partner.logo}
              width={520}
              height={160}
              className="max-h-32 w-auto object-contain" // ⬅️ сильно выше
              sizes="(max-width: 640px) 280px, 520px"
              priority={idx < 2}
            />
          ))}
        </div>

        {/* <h2 className="mt-16 text-center text-base/7 font-light text-gray-600">
          {text}
        </h2> */}
      </div>
    </section>
  );
}
