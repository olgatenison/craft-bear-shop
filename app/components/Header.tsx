// app/components/Header.tsx
import type { Locale } from "@/app/lib/locale";
import LanguageSwitcher from "./ui/LanguageSwitcher";
import ProfileButton from "./ui/ProfileButton";
import HeaderSearch from "./ui/HeaderSearch";
import ShoppingCart from "./ui/ShoppingCart";

export default function Header({ lang }: { lang: Locale }) {
  return (
    <header className="relative z-10 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-end px-6 py-8 gap-3">
        <LanguageSwitcher current={lang} />
        <HeaderSearch lang={lang} />
        <ProfileButton lang={lang} />
        <span aria-hidden="true" className="mx-4 h-6 w-px bg-gray-400 " />
        <ShoppingCart lang={lang} />
      </div>
    </header>
  );
}
