// app/components/AgeGate.tsx
"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "age-confirmed";
const AGE_EVENT = "age-confirmed-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(AGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AGE_EVENT, callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return "loading";
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const ageConfirmed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const handleYes = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    window.dispatchEvent(new Event(AGE_EVENT));
  };

  const handleNo = () => {
    window.location.href = "https://www.instagram.com/craftbear.store";
  };

  const showGate = ageConfirmed !== "true" && ageConfirmed !== "loading";

  return (
    <>
      {/* Сайт всегда находится под AgeGate */}
      {children}

      {/* Age Gate поверх сайта */}
      {showGate && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-linear-to-b from-black/30 to-black/60 p-8 text-center shadow-lg shadow-black/50 ring-1 ring-white/15 backdrop-blur-xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500">
              18+ Only
            </p>

            <h1 className="text-3xl font-semibold text-white">
              Are you 18 or older?
            </h1>

            <p className="mt-4 text-base/6 text-gray-300">
              You must be at least 18 years old to enter this website.
            </p>

            <div className="mt-8 flex items-center justify-center gap-x-10">
              <button
                type="button"
                onClick={handleYes}
                className="rounded-md bg-linear-to-br from-stone-300/20 to-stone-900/50 px-4 py-2 text-base font-semibold text-yellow-500 shadow-sm hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Yes, I am 18+
              </button>

              <button
                type="button"
                onClick={handleNo}
                className="text-base/6 font-semibold text-white hover:text-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
