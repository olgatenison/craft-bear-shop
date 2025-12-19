"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

type HeaderSearchMessages = {
  HeaderSearch?: { label?: string; placeholder?: string };
};

type SearchItem = {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; alt?: string | null };
  price?: { amount: string; currencyCode: string };
};

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function HeaderSearch({
  lang,
  messages,
  label,
}: {
  lang: string;
  messages?: HeaderSearchMessages;
  label?: string;
}) {
  const Label = label ?? messages?.HeaderSearch?.label ?? "Search products";
  const Placeholder = messages?.HeaderSearch?.placeholder ?? "Search…";

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 250);

  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .search-results-scroll::-webkit-scrollbar {
        width: 8px;
      }
      .search-results-scroll::-webkit-scrollbar-track {
        background: #1f2937;
        border-radius: 4px;
      }
      .search-results-scroll::-webkit-scrollbar-thumb {
        background: #515151;
        border-radius: 4px;
      }
      .search-results-scroll::-webkit-scrollbar-thumb:hover {
        background: #e0e0e0;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Hotkey: Cmd/Ctrl + K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // focus input when open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // fetch results
  useEffect(() => {
    if (!open) return;

    const query = debouncedQ.trim();
    if (query.length < 2) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `/${lang}/api/search?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = (await res.json()) as { items: SearchItem[] };
        setItems(data.items ?? []);
      } catch (e: unknown) {
        if (
          e &&
          typeof e === "object" &&
          "name" in e &&
          e.name === "AbortError"
        )
          return;
        const errorMessage =
          e &&
          typeof e === "object" &&
          "message" in e &&
          typeof e.message === "string"
            ? e.message
            : "Search error";
        setError(errorMessage);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQ, open, lang]);

  const close = () => {
    setOpen(false);
    setQ("");
    setItems([]);
    setError(null);
    setLoading(false);
  };

  const hasQuery = useMemo(() => q.trim().length > 0, [q]);

  return (
    <>
      <button
        type="button"
        aria-label={Label}
        onClick={() => setOpen(true)}
        className="p-2 text-gray-400 hover:text-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 rounded-md transition-colors"
      >
        <span className="sr-only">{Label}</span>
        <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={Label}
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
        >
          {/* Dark overlay */}
          <button
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Dark modal matching your style */}
          <div className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-800">
            {/* Search input */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={Placeholder}
                className="w-full bg-transparent outline-none text-white placeholder:text-gray-500 text-lg"
              />
              <button
                type="button"
                onClick={close}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors shrink-0"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Results area */}
            <div
              className="max-h-[60vh] overflow-y-auto search-results-scroll"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#515151 #1f2937",
              }}
            >
              {/* Status message */}
              <div className="px-6 py-3 text-sm text-gray-400">
                {loading && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                    <span>Searching…</span>
                  </div>
                )}
                {!loading && error && (
                  <span className="text-red-400">{error}</span>
                )}
                {!loading && !error && !hasQuery && (
                  <span>Type at least 2 characters to search...</span>
                )}
                {!loading &&
                  !error &&
                  hasQuery &&
                  items.length === 0 &&
                  debouncedQ.trim().length >= 2 && (
                    <span>No results found for &ldquo;{debouncedQ}&rdquo;</span>
                  )}
              </div>

              {/* Results list */}
              {items.length > 0 && (
                <ul className="divide-y divide-gray-800">
                  {items.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/${lang}/product/${p.handle}`}
                        onClick={close}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors group"
                      >
                        {/* Product image */}
                        <div className="h-14 w-14 rounded-lg bg-gray-800 overflow-hidden shrink-0 border border-gray-700 relative">
                          {p.image?.url ? (
                            <Image
                              src={p.image.url}
                              alt={p.image.alt ?? p.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-600">
                              <MagnifyingGlassIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Product info */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-base font-medium text-white group-hover:text-yellow-500 transition-colors">
                            {p.title}
                          </div>
                          <div className="truncate text-sm text-gray-500 mt-0.5">
                            /{p.handle}
                          </div>
                        </div>

                        {/* Price */}
                        {p.price?.amount && (
                          <div className="text-base font-semibold text-yellow-500 whitespace-nowrapshrink-0">
                            {Number(p.price.amount).toFixed(2)}{" "}
                            {p.price.currencyCode}
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer tip */}
            <div className="px-6 py-3 text-xs text-gray-500 border-t border-gray-800 flex items-center justify-center gap-4">
              <span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 font-mono">
                  Ctrl/⌘ K
                </kbd>{" "}
                to open
              </span>
              <span className="text-gray-700">•</span>
              <span>
                <kbd className="px-2 py-1 bg-gray-800 rounded text-gray-400 font-mono">
                  Esc
                </kbd>{" "}
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import Link from "next/link";
// import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

// type HeaderSearchMessages = {
//   HeaderSearch?: { label?: string; placeholder?: string };
// };

// type SearchItem = {
//   id: string;
//   title: string;
//   handle: string;
//   image?: { url: string; alt?: string | null };
//   price?: { amount: string; currencyCode: string };
// };

// function useDebouncedValue<T>(value: T, delay = 250) {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return debounced;
// }

// export default function HeaderSearch({
//   lang,
//   messages,
//   label,
// }: {
//   lang: string;
//   messages?: HeaderSearchMessages;
//   /** кастомная подпись (перебьёт messages) */
//   label?: string;
// }) {
//   // 👇 фикс приоритета: label должен перебивать messages
//   const Label = label ?? messages?.HeaderSearch?.label ?? "Search products";
//   const Placeholder = messages?.HeaderSearch?.placeholder ?? "Search…";

//   const [open, setOpen] = useState(false);
//   const [q, setQ] = useState("");
//   const debouncedQ = useDebouncedValue(q, 250);

//   const [items, setItems] = useState<SearchItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const inputRef = useRef<HTMLInputElement | null>(null);

//   // Hotkey: Cmd/Ctrl + K
//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       const isK = e.key.toLowerCase() === "k";
//       if ((e.ctrlKey || e.metaKey) && isK) {
//         e.preventDefault();
//         setOpen(true);
//       }
//       if (e.key === "Escape") setOpen(false);
//     };
//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, []);

//   // focus input when open
//   useEffect(() => {
//     if (!open) return;
//     const t = setTimeout(() => inputRef.current?.focus(), 0);
//     return () => clearTimeout(t);
//   }, [open]);

//   // fetch results
//   useEffect(() => {
//     if (!open) return;

//     const query = debouncedQ.trim();
//     if (query.length < 2) {
//       setItems([]);
//       setLoading(false);
//       setError(null);
//       return;
//     }

//     const controller = new AbortController();
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const res = await fetch(
//           `/${lang}/api/search?q=${encodeURIComponent(query)}`,
//           {
//             signal: controller.signal,
//             cache: "no-store",
//           }
//         );
//         if (!res.ok) throw new Error(`Search failed (${res.status})`);
//         const data = (await res.json()) as { items: SearchItem[] };
//         setItems(data.items ?? []);
//       } catch (e: any) {
//         if (e?.name === "AbortError") return;
//         setError(e?.message ?? "Search error");
//         setItems([]);
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => controller.abort();
//   }, [debouncedQ, open, lang]);

//   // close + reset helper
//   const close = () => {
//     setOpen(false);
//     setQ("");
//     setItems([]);
//     setError(null);
//     setLoading(false);
//   };

//   const hasQuery = useMemo(() => q.trim().length > 0, [q]);

//   return (
//     <>
//       <button
//         type="button"
//         aria-label={Label}
//         onClick={() => setOpen(true)}
//         className="p-2 text-gray-400 hover:text-yellow-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 rounded-md"
//       >
//         <span className="sr-only">{Label}</span>
//         <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
//       </button>

//       {open && (
//         <div
//           role="dialog"
//           aria-modal="true"
//           aria-label={Label}
//           className="fixed inset-0 z-50"
//         >
//           {/* overlay */}
//           <button
//             aria-label="Close search"
//             onClick={close}
//             className="absolute inset-0 bg-black/40"
//           />

//           {/* modal */}
//           <div className="relative mx-auto mt-24 w-[min(720px,92vw)] rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
//             <div className="flex items-center gap-2 px-4 py-3 border-b">
//               <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
//               <input
//                 ref={inputRef}
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder={Placeholder}
//                 className="w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
//               />
//               <button
//                 type="button"
//                 onClick={close}
//                 className="p-2 rounded-md text-gray-400 hover:text-gray-700"
//                 aria-label="Close"
//               >
//                 <XMarkIcon className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="max-h-[60vh] overflow-auto">
//               {/* status row */}
//               <div className="px-4 py-2 text-sm text-gray-500">
//                 {loading && "Searching…"}
//                 {!loading && error && (
//                   <span className="text-red-600">{error}</span>
//                 )}
//                 {!loading && !error && !hasQuery && (
//                   <span>Type at least 2 characters…</span>
//                 )}
//                 {!loading &&
//                   !error &&
//                   hasQuery &&
//                   items.length === 0 &&
//                   debouncedQ.trim().length >= 2 && <span>No results</span>}
//               </div>

//               {/* results */}
//               {items.length > 0 && (
//                 <ul className="divide-y">
//                   {items.map((p) => (
//                     <li key={p.id}>
//                       <Link
//                         href={`/${lang}/product/${p.handle}`} // ⚠️ если у тебя другой путь — поменяй здесь
//                         onClick={close}
//                         className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
//                       >
//                         <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
//                           {p.image?.url ? (
//                             // eslint-disable-next-line @next/next/no-img-element
//                             <img
//                               src={p.image.url}
//                               alt={p.image.alt ?? p.title}
//                               className="h-full w-full object-cover"
//                               loading="lazy"
//                             />
//                           ) : null}
//                         </div>

//                         <div className="min-w-0 flex-1">
//                           <div className="truncate text-sm font-medium text-gray-900">
//                             {p.title}
//                           </div>
//                           <div className="truncate text-xs text-gray-500">
//                             /{p.handle}
//                           </div>
//                         </div>

//                         {p.price?.amount && (
//                           <div className="text-sm text-gray-700 whitespace-nowrap">
//                             {Number(p.price.amount).toFixed(2)}{" "}
//                             {p.price.currencyCode}
//                           </div>
//                         )}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>

//             <div className="px-4 py-2 text-xs text-gray-400 border-t">
//               Tip: <span className="font-medium">Ctrl/⌘ + K</span> to open,{" "}
//               <span className="font-medium">Esc</span> to close
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
