// app/components/Header.tsx
import type { Locale } from "../lib/locale";
import LanguageSwitcher from "./ui/LanguageSwitcher";
import ProfileButton from "./ui/ProfileButton";
import HeaderSearch from "./ui/HeaderSearch";
import ShoppingCart from "./ui/ShoppingCart";
import { getMessages } from "@/app/[lang]/messages";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

export default async function Header({ lang }: { lang: Locale }) {
  const messages = await getMessages(lang);
  const t = messages.common;

  return (
    <header className="relative">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 gap-6 border-b border-yellow-400 py-2">
        {/* Navigation Links */}
        <nav className="flex items-center gap-6">
          <Link
            href={`/${lang}`}
            className="text-base font-normal text-gray-400 hover:text-yellow-500"
          >
            {t.home}
          </Link>
          <Link
            href={`/${lang}/shop`}
            className="text-base font-normal text-gray-400 hover:text-yellow-500"
          >
            {t.shop}
          </Link>
          <Link
            href={`/${lang}/contact`}
            className="text-base font-normal text-gray-400 hover:text-yellow-500"
          >
            {t.contact}
          </Link>
        </nav>

        <Link
          href={`/${lang}`}
          aria-label="Craft Bear"
          className="absolute left-1/2 -translate-x-1/2 top-2 z-10"
        >
          <Image
            src="/logo-green-txt.svg"
            alt="Craft Bear Logo"
            width={220}
            height={220}
            priority
            className="h-16 w-auto object-contain sm:h-20 lg:h-27 drop-shadow-md"
          />
        </Link>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <Suspense fallback={null}>
            <LanguageSwitcher current={lang} />
          </Suspense>

          <Suspense fallback={null}>
            <HeaderSearch lang={lang} />
          </Suspense>

          <ProfileButton lang={lang} />
          <span aria-hidden="true" className="mx-4 h-4 w-px bg-gray-400" />
          <ShoppingCart lang={lang} messages={messages} />
        </div>
      </div>
    </header>
  );
}
