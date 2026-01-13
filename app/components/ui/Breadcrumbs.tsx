"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Lang = "en" | "uk" | "ru" | "et" | "fi";

type CategoryKey =
  | "all"
  | "beer"
  | "draft-beer"
  | "cider"
  | "non-alcoholic"
  | "snacks"
  | "gifts-sets";

const CATEGORY_KEYS: CategoryKey[] = [
  "all",
  "beer",
  "draft-beer",
  "cider",
  "non-alcoholic",
  "snacks",
  "gifts-sets",
];

const CATEGORY_SET = new Set<CategoryKey>(CATEGORY_KEYS);

// Простая нормализация: убираем пробелы, приводим к lowercase
function normalizeKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

// Маппинг альтернативных написаний к правильным ключам
const CATEGORY_ALIASES: Record<string, CategoryKey> = {
  // draft-beer aliases
  "draft-beer": "draft-beer",
  draftbeer: "draft-beer",
  "draught-beer": "draft-beer",
  draughtbeer: "draft-beer",

  // non-alcoholic aliases
  "non-alcoholic": "non-alcoholic",
  nonalcoholic: "non-alcoholic",
  "alcohol-free": "non-alcoholic",
  alcoholfree: "non-alcoholic",

  // gifts-sets aliases
  "gifts-sets": "gifts-sets",
  "gift-sets": "gifts-sets",
  "gifts-and-sets": "gifts-sets",

  // остальные категории (прямое соответствие)
  all: "all",
  beer: "beer",
  cider: "cider",
  snacks: "snacks",
  gifts: "gifts-sets",
  sets: "gifts-sets",
};

/**
 * Преобразует строку категории в валидный ключ CategoryKey
 * Возвращает null если категория не распознана
 */
function resolveCategory(input?: string | null): CategoryKey | null {
  if (!input) return null;

  const normalized = normalizeKey(input);

  // Проверяем прямое совпадение с ключами
  if (CATEGORY_SET.has(normalized as CategoryKey)) {
    return normalized as CategoryKey;
  }

  // Проверяем алиасы
  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }

  return null;
}

export type BreadcrumbLabels = {
  home: string;
  shop: string;
  categories: Record<CategoryKey, string>;
};

interface BreadcrumbsProps {
  lang: Lang;
  labels: BreadcrumbLabels;
  currentLabel?: string;
  productCategory?: string;
  separator?: string;
}

export default function Breadcrumbs({
  lang,
  labels,
  currentLabel,
  productCategory,
  separator = "›",
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items: { href: string; label: string }[] = [
    { href: `/${lang}`, label: labels.home },
  ];

  const parts = pathname.split("/").filter(Boolean);
  const afterLang = parts.slice(1);

  const isShopPage = afterLang[0] === "shop";
  const isProductPage = afterLang[0] === "product";

  if (isShopPage) {
    items.push({ href: `/${lang}/shop`, label: labels.shop });

    const categoryFromQuery =
      resolveCategory(searchParams.get("category")) ?? "all";

    // Показываем категорию в крошках только если это не "all"
    if (categoryFromQuery !== "all") {
      items.push({
        href: `/${lang}/shop?category=${categoryFromQuery}`,
        label: labels.categories[categoryFromQuery],
      });
    }
  }

  if (isProductPage) {
    items.push({ href: `/${lang}/shop`, label: labels.shop });

    const categoryFromProduct = resolveCategory(productCategory);

    // Добавляем категорию продукта, если она есть и не "all"
    if (categoryFromProduct && categoryFromProduct !== "all") {
      items.push({
        href: `/${lang}/shop?category=${categoryFromProduct}`,
        label: labels.categories[categoryFromProduct],
      });
    }
  }

  // Добавляем текущую страницу (название продукта)
  if (currentLabel) {
    items.push({ href: "#", label: currentLabel });
  }

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl pb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.href}-${i}`} className="flex items-center">
              {i > 0 && (
                <span aria-hidden="true" className="pr-3 text-gray-400">
                  {separator}
                </span>
              )}
              {last ? (
                <span className="text-sm font-medium text-gray-300">
                  {it.label}
                </span>
              ) : (
                <Link
                  href={it.href}
                  className="text-sm font-medium text-gray-400 hover:text-white"
                >
                  {it.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
