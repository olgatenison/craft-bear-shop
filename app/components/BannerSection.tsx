// app/components/BannerSection.tsx

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

type PartyBannerMessages = {
  title: string;
  subtitle: string;
  kegsButton: string;
  boxesButton: string;
};

type BannerSectionProps = {
  lang: Locale;
  messages: {
    PartyBanner: PartyBannerMessages;
  };
  priority?: boolean;
};

export default function BannerSection({
  lang,
  messages,
  priority = false,
}: BannerSectionProps) {
  const t = messages.PartyBanner;

  return (
    <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:max-w-7xl">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
          {/* Left content */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t.title}
              </h2>

              <p className="mt-6 text-base leading-8 text-gray-400">
                {t.subtitle}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/${lang}/shop?category=kegs`}
                  className="inline-flex items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  {t.kegsButton}
                </Link>

                <Link
                  href={`/${lang}/shop?category=beer-boxes`}
                  className="inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  {t.boxesButton}
                </Link>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative min-h-80 lg:min-h-[420px]">
            <Image
              src="/category/baner.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={priority}
            />

            <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
