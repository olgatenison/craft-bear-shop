"use client";

import { useEffect, useState } from "react";

type BannerCookieClientProps = {
  text: string;
  acceptLabel: string;
  rejectLabel: string;
  policyLabel: string;
  policyHref: string;
};

const STORAGE_KEY = "cookie-consent"; // accepted | rejected

export default function BannerCookieClient({
  text,
  acceptLabel,
  rejectLabel,
  policyLabel,
  policyHref,
}: BannerCookieClientProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      setVisible(true);
    }
  }, []);

  const handleChoice = (choice: "accepted" | "rejected") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, choice);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
      <div
        className="pointer-events-auto ml-auto max-w-xl     w-auto
        p-10
        data-closed:translate-y-1 data-closed:opacity-0
        data-enter:duration-200 data-leave:duration-150 data-enter:ease-out data-leave:ease-in

        rounded-2xl shadow-2xl shadow-black/50
        ring-1 ring-white/15 dark:ring-stone/20
        bg-linear-to-b from-white/55 to-white/20
        dark:from-stone-950/75 dark:to-stone-950/80
        backdrop-blur-sm"
      >
        <p className="text-base/7 text-gray-300 pb-6">
          {text}{" "}
          <a
            href={policyHref}
            className="font-semibold text-white  hover:text-yellow-500"
          >
            {policyLabel}
          </a>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-10 ">
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="rounded-md text-yellow-500 bg-linear-to-br from-stone-300/20 to-stone-900/50 px-4 py-2 text-sm/6 font-semibold hover:bg-linear-to-br hover:from-stone-300/30 hover:to-stone-900/60 hover:text-white focus:text-white"
          >
            {acceptLabel}
          </button>
          <button
            type="button"
            onClick={() => handleChoice("rejected")}
            className="text-sm/6 font-semibold text-white hover:text-gray-300"
          >
            {rejectLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
