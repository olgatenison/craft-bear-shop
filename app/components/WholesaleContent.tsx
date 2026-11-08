import Link from "next/link";
import type { Locale } from "@/app/lib/locale";
import WholesaleExportButton from "./WholesaleExportButton";

export type WholesaleUnit = "bottle" | "can" | "box" | "liter" | "keg";

export type KegMaterial = "plastic" | "metal";

export type WholesaleProduct = {
  id: string;
  title: string;
  handle: string;
  wholesalePrice: string;
  currencyCode: string;
  wholesaleUnit?: WholesaleUnit;
  quantityPerBox?: number;
  kegVolumeLiters?: number;
  kegMaterial?: KegMaterial;
};

export type WholesaleTableTranslations = {
  bottles: string;
  kegs: string;
  unitPrice: string;
  quantity: string;
  boxPrice: string;
  vat: string;
  volume: string;
  material: string;
  literPrice: string;
  kegPrice: string;
  metal: string;
  plastic: string;
  literSymbol: string;
};

type WholesaleUnits = Record<WholesaleUnit, string>;

type WholesaleContentProps = {
  lang: Locale;
  products: WholesaleProduct[];
  title: string;
  intro: string;
  productLabel: string;
  priceLabel: string;
  viewProductLabel: string;
  contactText: string;
  contactLabel: string;
  units: WholesaleUnits;
  table: WholesaleTableTranslations;
};

const VAT_RATE = 0.24;

const localeMap: Record<Locale, string> = {
  uk: "uk-UA",
  ru: "ru-RU",
  en: "en-IE",
  et: "et-EE",
  fi: "fi-FI",
};

function formatPrice(value: number, currency: string, lang: Locale) {
  return new Intl.NumberFormat(localeMap[lang] ?? "en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isKegProduct(product: WholesaleProduct) {
  return (
    product.wholesaleUnit === "keg" ||
    (product.wholesaleUnit === "liter" &&
      product.kegVolumeLiters !== undefined &&
      product.kegVolumeLiters > 0)
  );
}

function getBottlePrices(product: WholesaleProduct) {
  const unitPrice = Number(product.wholesalePrice);
  const quantity = product.quantityPerBox;

  const isBox = product.wholesaleUnit === "box";
  const isPackaged =
    product.wholesaleUnit === "bottle" || product.wholesaleUnit === "can";

  const hasQuantity =
    quantity !== undefined && Number.isInteger(quantity) && quantity > 0;

  const boxPrice = isBox
    ? roundMoney(unitPrice)
    : isPackaged && hasQuantity
      ? roundMoney(unitPrice * quantity!)
      : null;

  const withVat =
    boxPrice !== null ? roundMoney(boxPrice * (1 + VAT_RATE)) : null;

  return {
    unitPrice,
    quantity: isPackaged && hasQuantity ? quantity! : null,
    isBox,
    boxPrice,
    withVat,
  };
}

function getKegPrices(product: WholesaleProduct) {
  const wholesalePrice = Number(product.wholesalePrice);
  const volume = product.kegVolumeLiters;

  const hasVolume =
    volume !== undefined && Number.isFinite(volume) && volume > 0;

  const isPerLiter = product.wholesaleUnit === "liter";

  const kegPrice = isPerLiter
    ? hasVolume
      ? roundMoney(wholesalePrice * volume!)
      : null
    : roundMoney(wholesalePrice);

  const literPrice = isPerLiter
    ? wholesalePrice
    : hasVolume && kegPrice !== null
      ? kegPrice / volume!
      : null;

  const withVat =
    kegPrice !== null ? roundMoney(kegPrice * (1 + VAT_RATE)) : null;

  return {
    volume: hasVolume ? volume! : null,
    kegPrice,
    literPrice,
    withVat,
  };
}

type MobileRowProps = {
  label: string;
  value: string;
  accent?: boolean;
};

function MobileRow({ label, value, accent = false }: MobileRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400">{label}</span>

      <span
        className={`text-right text-sm font-medium ${
          accent ? "text-yellow-400" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

type CardProps = {
  product: WholesaleProduct;
  index: number;
  lang: Locale;
  labels: WholesaleTableTranslations;
  units: WholesaleUnits;
  priceLabel: string;
  viewProductLabel: string;
};

function BottleCard({
  product,
  index,
  lang,
  labels,
  units,
  priceLabel,
  viewProductLabel,
}: CardProps) {
  const prices = getBottlePrices(product);

  const money = (value: number | null) =>
    value === null ? "—" : formatPrice(value, product.currencyCode, lang);

  const unitLabel = product.wholesaleUnit
    ? units[product.wholesaleUnit]
    : priceLabel;

  return (
    <article className="rounded-xl border border-white/10 bg-white/4 p-4">
      <div className="mb-5 flex items-start gap-3">
        <span className="text-sm text-gray-500">{index + 1}.</span>

        <Link
          href={`/${lang}/product/${product.handle}`}
          className="text-base font-semibold text-white transition-colors hover:text-yellow-400"
        >
          {product.title}
        </Link>
      </div>

      <div className="space-y-3">
        <MobileRow
          label={`${labels.unitPrice} (${unitLabel})`}
          value={prices.isBox ? "—" : money(prices.unitPrice)}
        />

        <MobileRow
          label={labels.quantity}
          value={prices.quantity !== null ? String(prices.quantity) : "—"}
        />

        <div className="border-t border-white/10 pt-3">
          <MobileRow label={labels.boxPrice} value={money(prices.boxPrice)} />
        </div>

        <div className="rounded-lg bg-yellow-400/6 p-3">
          <MobileRow label={labels.vat} value={money(prices.withVat)} accent />
        </div>
      </div>

      <Link
        href={`/${lang}/product/${product.handle}`}
        className="mt-5 flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {viewProductLabel}
      </Link>
    </article>
  );
}

function KegCard({
  product,
  index,
  lang,
  labels,
  viewProductLabel,
}: CardProps) {
  const prices = getKegPrices(product);

  const money = (value: number | null) =>
    value === null ? "—" : formatPrice(value, product.currencyCode, lang);

  const material =
    product.kegMaterial === "metal"
      ? labels.metal
      : product.kegMaterial === "plastic"
        ? labels.plastic
        : "—";

  return (
    <article className="rounded-xl border border-white/10 bg-white/4 p-4">
      <div className="mb-5 flex items-start gap-3">
        <span className="text-sm text-gray-500">{index + 1}.</span>

        <Link
          href={`/${lang}/product/${product.handle}`}
          className="text-base font-semibold text-white transition-colors hover:text-yellow-400"
        >
          {product.title}
        </Link>
      </div>

      <div className="space-y-3">
        <MobileRow
          label={labels.volume}
          value={
            prices.volume !== null
              ? `${prices.volume} ${labels.literSymbol}`
              : "—"
          }
        />

        <MobileRow label={labels.material} value={material} />

        <MobileRow label={labels.literPrice} value={money(prices.literPrice)} />

        <div className="border-t border-white/10 pt-3">
          <MobileRow label={labels.kegPrice} value={money(prices.kegPrice)} />
        </div>

        <div className="rounded-lg bg-yellow-400/6 p-3">
          <MobileRow label={labels.vat} value={money(prices.withVat)} accent />
        </div>
      </div>

      <Link
        href={`/${lang}/product/${product.handle}`}
        className="mt-5 flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
      >
        {viewProductLabel}
      </Link>
    </article>
  );
}

export default function WholesaleContent({
  lang,
  products,
  title,
  intro,
  productLabel,
  priceLabel,
  viewProductLabel,
  contactText,
  contactLabel,
  units,
  table,
}: WholesaleContentProps) {
  const bottles = products.filter((product) => !isKegProduct(product));

  const kegs = products.filter(isKegProduct);

  const money = (value: number | null, currency: string) =>
    value === null ? "—" : formatPrice(value, currency, lang);

  const thClass = "px-3 pb-4 text-left text-xs font-medium text-gray-400";

  const tdClass = "px-3 py-6 align-middle text-sm text-gray-300";

  const productCell = (product: WholesaleProduct, index: number) => (
    <div className="flex items-start gap-4">
      <span className="w-6 shrink-0 text-sm text-gray-400">{index + 1}.</span>

      <div className="flex min-w-0 flex-col gap-2">
        <Link
          href={`/${lang}/product/${product.handle}`}
          className="text-base font-medium text-white transition-colors hover:text-yellow-400"
        >
          {product.title}
        </Link>

        <Link
          href={`/${lang}/product/${product.handle}`}
          className="w-fit border-b border-gray-500 text-xs text-gray-400 hover:text-gray-200"
        >
          {viewProductLabel}
        </Link>
      </div>
    </div>
  );

  return (
    <section className="relative mx-auto my-10 max-w-7xl">
      {/* HEADER */}
      <div className="mb-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{title}</h1>

            <p className="mt-4 max-w-3xl text-base text-gray-400">{intro}</p>
          </div>

          <WholesaleExportButton
            lang={lang}
            products={products}
            labels={table}
            units={units}
            productLabel={productLabel}
          />
        </div>
      </div>

      {/* BOTTLES */}
      {bottles.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {table.bottles}
          </h2>

          {/* MOBILE CARDS */}
          <div className="space-y-4 md:hidden">
            {bottles.map((product, index) => (
              <BottleCard
                key={product.id}
                product={product}
                index={index}
                lang={lang}
                labels={table}
                units={units}
                priceLabel={priceLabel}
                viewProductLabel={viewProductLabel}
              />
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-400/70">
                  <th className={`${thClass} w-[35%] pl-0`}>{productLabel}</th>
                  <th className={thClass}>{table.unitPrice}</th>
                  <th className={thClass}>{table.quantity}</th>
                  <th className={thClass}>{table.boxPrice}</th>
                  <th className={`${thClass} text-right`}>{table.vat}</th>
                </tr>
              </thead>

              <tbody>
                {bottles.map((product, index) => {
                  const p = getBottlePrices(product);

                  const unitLabel = product.wholesaleUnit
                    ? units[product.wholesaleUnit]
                    : priceLabel;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-400/40 transition-colors hover:bg-white/3"
                    >
                      <td className="py-6 pr-6 align-middle">
                        {productCell(product, index)}
                      </td>

                      <td className={tdClass}>
                        {p.isBox ? (
                          "—"
                        ) : (
                          <div>
                            <span className="whitespace-nowrap text-white">
                              {money(p.unitPrice, product.currencyCode)}
                            </span>
                            <div className="mt-1 text-xs text-gray-400">
                              {unitLabel}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className={tdClass}>{p.quantity ?? "—"}</td>

                      <td className={tdClass}>
                        <span className="whitespace-nowrap font-medium text-white">
                          {money(p.boxPrice, product.currencyCode)}
                        </span>
                      </td>

                      <td className={`${tdClass} text-right`}>
                        <span className="whitespace-nowrap font-semibold text-yellow-400">
                          {money(p.withVat, product.currencyCode)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KEGS */}
      {kegs.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {table.kegs}
          </h2>

          {/* MOBILE CARDS */}
          <div className="space-y-4 md:hidden">
            {kegs.map((product, index) => (
              <KegCard
                key={product.id}
                product={product}
                index={index}
                lang={lang}
                labels={table}
                units={units}
                priceLabel={priceLabel}
                viewProductLabel={viewProductLabel}
              />
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-400/70">
                  <th className={`${thClass} w-[30%] pl-0`}>{productLabel}</th>
                  <th className={thClass}>{table.volume}</th>
                  <th className={thClass}>{table.material}</th>
                  <th className={thClass}>{table.literPrice}</th>
                  <th className={thClass}>{table.kegPrice}</th>
                  <th className={`${thClass} text-right`}>{table.vat}</th>
                </tr>
              </thead>

              <tbody>
                {kegs.map((product, index) => {
                  const p = getKegPrices(product);

                  const material =
                    product.kegMaterial === "metal"
                      ? table.metal
                      : product.kegMaterial === "plastic"
                        ? table.plastic
                        : "—";

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-400/40 transition-colors hover:bg-white/3"
                    >
                      <td className="py-6 pr-6 align-middle">
                        {productCell(product, index)}
                      </td>

                      <td className={tdClass}>
                        {p.volume !== null
                          ? `${p.volume} ${table.literSymbol}`
                          : "—"}
                      </td>

                      <td className={tdClass}>{material}</td>

                      <td className={tdClass}>
                        <span className="whitespace-nowrap text-white">
                          {money(p.literPrice, product.currencyCode)}
                        </span>
                      </td>

                      <td className={tdClass}>
                        <span className="whitespace-nowrap font-medium text-white">
                          {money(p.kegPrice, product.currencyCode)}
                        </span>
                      </td>

                      <td className={`${tdClass} text-right`}>
                        <span className="whitespace-nowrap font-semibold text-yellow-400">
                          {money(p.withVat, product.currencyCode)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTACT */}
      <div className="mt-12 border-t border-white/10 pt-8">
        <p className="max-w-2xl text-base text-gray-400">{contactText}</p>

        <Link
          href={`/${lang}/partnership`}
          className="mt-6 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          {contactLabel}
        </Link>
      </div>
    </section>
  );
}
