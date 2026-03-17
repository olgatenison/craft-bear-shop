"use client";

import { useState, Suspense } from "react";
import type { Locale } from "../lib/locale";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import LanguageSwitcher from "./ui/LanguageSwitcher";
import ProfileButton from "./ui/ProfileButton";
import HeaderSearch from "./ui/HeaderSearch";
import ShoppingCart from "./ui/ShoppingCart";

type HeaderMessages = {
  common: {
    home: string;
    shop: string;
    contact: string;
    account: string;
    cart: string;
    menu: string;
    search: string;
    openMenu: string;
    closeMenu: string;
  };
  ShoppingCart?: {
    ariaLabel: string;
    emptyMessage: string;
    checkoutButton: string;
    itemsInCart: string;
  };
  HeaderSearch?: {
    label?: string;
    placeholder?: string;
    closeSearch?: string;
    close?: string;
    searching?: string;
    typeHint?: string;
    noResults?: string;
    hotkeyOpen?: string;
    hotkeyClose?: string;
  };
};

export default function HeaderClient({
  lang,
  messages,
}: {
  lang: Locale;
  messages: HeaderMessages;
}) {
  const t = messages.common;
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const baseLinkClass = "text-base font-normal transition-colors";
  const mobileBaseLinkClass =
    "block rounded-lg px-3 py-2 text-base font-normal transition-colors hover:bg-white/5";

  const isActive = (href: string) => pathname === href;
  const isSectionActive = (href: string) => pathname.startsWith(href);

  const getLinkClass = (href: string) =>
    `${baseLinkClass} ${
      isActive(href) ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
    }`;

  const getMobileLinkClass = (href: string) =>
    `${mobileBaseLinkClass} ${
      isActive(href) || isSectionActive(href + "/")
        ? "text-yellow-500"
        : "text-gray-400 hover:text-yellow-500"
    }`;

  const isAccountActive = isSectionActive(`/${lang}/account`);
  const isCartActive = isSectionActive(`/${lang}/cart`);

  const iconButtonClass = (active: boolean) =>
    active ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500";

  return (
    <header className="relative">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 border-b border-yellow-400 px-6 py-2 lg:h-22">
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

          <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
            <Link href={`/${lang}`} className={getLinkClass(`/${lang}`)}>
              {t.home}
            </Link>
            <Link
              href={`/${lang}/shop`}
              className={getLinkClass(`/${lang}/shop`)}
            >
              {t.shop}
            </Link>
            <Link
              href={`/${lang}/contact`}
              className={getLinkClass(`/${lang}/contact`)}
            >
              {t.contact}
            </Link>
          </nav>
        </div>

        <Link
          href={`/${lang}`}
          aria-label="Craft Bear"
          className="absolute left-1/2 top-2 z-10 -translate-x-1/2"
        >
          <Image
            src="/logo-green-txt.svg"
            alt="Craft Bear Logo"
            width={220}
            height={220}
            priority
            className="h-16 w-auto object-contain drop-shadow-md lg:h-27"
          />
        </Link>

        <div
          className="flex items-center gap-3"
          role="group"
          aria-label="Site controls"
        >
          <div className="hidden items-center gap-3 lg:flex">
            <Suspense fallback={null}>
              <LanguageSwitcher current={lang} />
            </Suspense>

            <Suspense fallback={null}>
              <HeaderSearch lang={lang} />
            </Suspense>

            <ProfileButton
              lang={lang}
              className={iconButtonClass(isAccountActive)}
            />
          </div>

          <ShoppingCart
            lang={lang}
            messages={messages}
            className={iconButtonClass(isCartActive)}
          />
        </div>
      </div>

      <Dialog open={mobileOpen} onClose={setMobileOpen} className="lg:hidden">
        <div className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
        <DialogPanel
          id="mobile-menu"
          className="fixed inset-y-0 right-0 z-50 h-dvh w-screen max-w-none overflow-y-auto bg-stone-950 p-6 ring-1 ring-white/10 sm:w-full sm:max-w-sm"
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

          <nav aria-label="Mobile main" className="mt-6 space-y-1">
            <Link
              href={`/${lang}`}
              onClick={() => setMobileOpen(false)}
              className={getMobileLinkClass(`/${lang}`)}
            >
              {t.home}
            </Link>
            <Link
              href={`/${lang}/shop`}
              onClick={() => setMobileOpen(false)}
              className={getMobileLinkClass(`/${lang}/shop`)}
            >
              {t.shop}
            </Link>
            <Link
              href={`/${lang}/contact`}
              onClick={() => setMobileOpen(false)}
              className={getMobileLinkClass(`/${lang}/contact`)}
            >
              {t.contact}
            </Link>
          </nav>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t.search}
            </p>
            <Suspense fallback={null}>
              <div className="w-full">
                <HeaderSearch lang={lang} messages={messages} />
              </div>
            </Suspense>
          </div>

          <nav
            aria-label="Mobile actions"
            className="mt-6 space-y-1 border-t border-white/10 pt-6"
          >
            <Link
              href={`/${lang}/account`}
              onClick={() => setMobileOpen(false)}
              className={getMobileLinkClass(`/${lang}/account`)}
            >
              {t.account}
            </Link>
            <Link
              href={`/${lang}/cart`}
              onClick={() => setMobileOpen(false)}
              className={getMobileLinkClass(`/${lang}/cart`)}
            >
              {t.cart}
            </Link>
          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">
            <Suspense fallback={null}>
              <LanguageSwitcher current={lang} />
            </Suspense>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
