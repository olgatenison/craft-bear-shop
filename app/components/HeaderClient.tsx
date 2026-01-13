"use client";

import { useState, Suspense } from "react";
import type { Locale } from "../lib/locale";
import Link from "next/link";
import Image from "next/image";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import LanguageSwitcher from "./ui/LanguageSwitcher";
import ProfileButton from "./ui/ProfileButton";
import HeaderSearch from "./ui/HeaderSearch";
import ShoppingCart from "./ui/ShoppingCart";

export default function HeaderClient({
  lang,
  messages,
}: {
  lang: Locale;
  messages: any;
}) {
  const t = messages.common;
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = "text-base font-normal text-gray-400 hover:text-yellow-500";
  const mobileLinkClass =
    "block rounded-lg px-3 py-2 text-base font-normal text-gray-400 hover:text-yellow-500 hover:bg-white/5";

  return (
    <header className="relative">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 gap-6 border-b border-yellow-400 py-2 lg:h-22 h-16">
        {/* Left: burger (mobile) + desktop nav */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-yellow-500 lg:hidden"
            aria-label={t.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-6">
            <Link href={`/${lang}`} className={linkClass}>
              {t.home}
            </Link>
            <Link href={`/${lang}/shop`} className={linkClass}>
              {t.shop}
            </Link>
            <Link href={`/${lang}/contact`} className={linkClass}>
              {t.contact}
            </Link>
          </nav>
        </div>

        {/* Center logo */}
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
            className="h-16  w-auto object-contain  lg:h-27 drop-shadow-md"
          />
        </Link>

        {/* Right: desktop controls + cart always */}
        <div
          className="flex items-center gap-3"
          role="group"
          aria-label="Site controls"
        >
          <div className="hidden lg:flex items-center gap-3">
            <Suspense fallback={null}>
              <LanguageSwitcher current={lang} />
            </Suspense>

            <Suspense fallback={null}>
              <HeaderSearch lang={lang} />
            </Suspense>

            <ProfileButton lang={lang} />
            {/* <span aria-hidden="true" className="mx-4 h-4 w-px bg-gray-400" /> */}
          </div>

          {/* Cart stays visible on mobile */}
          <ShoppingCart lang={lang} messages={messages} />
        </div>
      </div>

      {/* Mobile menu */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="lg:hidden">
        <div className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
        <DialogPanel
          id="mobile-menu"
          className="
    fixed inset-y-0 right-0 z-50 h-dvh overflow-y-auto
    bg-stone-950 p-6 ring-1 ring-white/10

    w-screen max-w-none
    sm:w-full sm:max-w-sm
  "
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">{t.menu}</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-300 hover:text-yellow-500"
              aria-label={t.closeMenu}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* 1) Left nav first */}
          <nav aria-label="Mobile main" className="mt-6 space-y-1">
            <Link
              href={`/${lang}`}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {t.home}
            </Link>
            <Link
              href={`/${lang}/shop`}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {t.shop}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {t.contact}
            </Link>
          </nav>

          {/* Search (переведён) */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t.search}
            </p>
            <Suspense fallback={null}>
              {/* Если HeaderSearch “узкий”, можно дать ему ширину через его контейнер */}
              <div className="w-full">
                <HeaderSearch lang={lang} messages={messages} />
              </div>
            </Suspense>
          </div>

          {/* 2) Actions as words */}
          <nav
            aria-label="Mobile actions"
            className="mt-6 pt-6 border-t border-white/10 space-y-1"
          >
            <Link
              href={`/${lang}/account`}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {t.account}
            </Link>
            <Link
              href={`/${lang}/cart`}
              onClick={() => setMobileOpen(false)}
              className={mobileLinkClass}
            >
              {t.cart}
            </Link>
          </nav>

          {/* 3) Language at the very bottom */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <Suspense fallback={null}>
              <LanguageSwitcher current={lang} />
            </Suspense>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
