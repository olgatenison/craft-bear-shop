// app/components/Header.tsx
import type { Locale } from "@/app/lib/locale";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header({ lang }: { lang: Locale }) {
  return (
    <header className="relative z-10 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-6 py-3">
        <LanguageSwitcher current={lang} />
      </div>
    </header>
  );
}
