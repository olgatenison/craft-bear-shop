"use client";

import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/app/lib/locale";

type ProfileButtonProps = {
  lang: Locale;
  className?: string;
};

export default function ProfileButton({
  lang,
  className = "",
}: ProfileButtonProps) {
  return (
    <Link
      href={`/${lang}/account`}
      aria-label="Account"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg
                  transition-colors hover:bg-white/5
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                  focus-visible:ring-offset-2 focus-visible:ring-offset-black/40
                  ${className}`}
    >
      <UserIcon aria-hidden="true" className="h-6 w-6" />
      <span className="sr-only">Account</span>
    </Link>
  );
}
