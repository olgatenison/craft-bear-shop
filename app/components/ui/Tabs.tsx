"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/16/solid";

const tabs = [
  { name: "All Products", href: "/products", current: true },
  { name: "Beer", href: "/products/beer", current: false },
  { name: "Cider", href: "/products/cider", current: false },
  { name: "Snacks", href: "/products/snacks", current: false },
];

// tiny utility
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs() {
  const pathname = usePathname();
  const router = useRouter();

  // Mark current by comparing with pathname
  const enriched = tabs.map((t) => ({
    ...t,
    current:
      pathname === t.href || (t.href !== "/" && pathname?.startsWith(t.href)),
  }));

  const currentHref = enriched.find((t) => t.current)?.href ?? enriched[0].href;

  return (
    <div className="border-b border-white/10 pb-5 sm:pb-0 max-w-7xl px-8">
      <h3 className="text-2xl tracking-tight text-white">Candidates</h3>

      <div className="mt-3 sm:mt-4">
        {/* Mobile */}
        <div className="grid grid-cols-1 sm:hidden">
          <select
            value={currentHref}
            onChange={(e) => router.push(e.target.value)}
            aria-label="Select a tab"
            className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white/5 py-2 pl-3 pr-8 text-base text-white outline-1 -outline-offset-1 outline-white/10 *:bg-gray-800 focus:outline-2 focus:-outline-offset-2 focus:outline-white"
          >
            {enriched.map((tab) => (
              <option key={tab.name} value={tab.href}>
                {tab.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-400"
          />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {enriched.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? "page" : undefined}
                className={classNames(
                  tab.current
                    ? "border-yellow-400 text-yellow-400"
                    : "border-transparent text-gray-400 hover:border-white/20 hover:text-white",
                  "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium"
                )}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
