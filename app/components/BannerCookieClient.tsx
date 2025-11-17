"use client";

import { useState } from "react";

type BannerCookieClientProps = {
  text: string;
  acceptLabel: string;
  rejectLabel: string;
  policyLabel: string;
  policyHref: string;
};

const STORAGE_KEY = "cookie-consent"; // "accepted" | "rejected"

export default function BannerCookieClient({
  text,
  acceptLabel,
  rejectLabel,
  policyLabel,
  policyHref,
}: BannerCookieClientProps) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    const value = window.localStorage.getItem(STORAGE_KEY);
    return !value;
  });

  const handleChoice = (choice: "accepted" | "rejected") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, choice);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6 z-50">
      <div className="pointer-events-auto ml-auto max-w-xl rounded-xl bg-gray-800 p-6  outline-1 -outline-offset-1 outline-white/10 shadow-xl">
        <p className="text-sm/6 text-white">
          {text}{" "}
          <a
            href={policyHref}
            className="font-semibold text-gray-400 underline hover:text-yellow-500"
          >
            {policyLabel}
          </a>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            type="button"
            onClick={() => handleChoice("accepted")}
            className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
