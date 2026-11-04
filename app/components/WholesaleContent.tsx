import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

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

function formatPrice(value: number, currency: string, lang: Locale): string {
  const locales: Record<Locale, string> = {
    uk: "uk-UA",
    ru: "ru-RU",
    en: "en-IE",
    et: "et-EE",
    fi: "fi-FI",
  };

  return new Intl.NumberFormat(locales[lang] ?? "en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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
  const labels = table;

  const isKegProduct = (product: WholesaleProduct): boolean => {
    return (
      product.wholesaleUnit === "keg" ||
      (product.wholesaleUnit === "liter" &&
        product.kegVolumeLiters !== undefined &&
        product.kegVolumeLiters > 0)
    );
  };

  const bottles = products.filter((product) => !isKegProduct(product));

  const kegs = products.filter(isKegProduct);

  const price = (value: number, currency: string) =>
    formatPrice(value, currency, lang);

  const tableClass = "w-full min-w-[900px] border-collapse text-left";

  const thClass = "px-3 pb-4 text-xs font-medium text-gray-400";

  const tdClass = "px-3 py-6 text-sm text-gray-300 align-middle";

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
          className="w-fit border-b border-gray-500 text-xs text-gray-400 transition-colors hover:border-gray-200 hover:text-gray-200"
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
        <h1 className="text-xl font-semibold text-white">{title}</h1>

        <p className="mt-4 max-w-3xl text-base text-gray-400">{intro}</p>
      </div>

      {/* BOTTLES AND CANS */}
      {bottles.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-lg font-semibold text-white">
            {labels.bottles}
          </h2>

          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr className="border-b border-gray-400/70">
                  <th className={`${thClass} w-[35%] pl-0`}>{productLabel}</th>

                  <th className={thClass}>{labels.unitPrice}</th>

                  <th className={thClass}>{labels.quantity}</th>

                  <th className={thClass}>{labels.boxPrice}</th>

                  <th className={`${thClass} text-right`}>{labels.vat}</th>
                </tr>
              </thead>

              <tbody>
                {bottles.map((product, index) => {
                  const unitPrice = Number(product.wholesalePrice);

                  const quantity = product.quantityPerBox;

                  const isBox = product.wholesaleUnit === "box";

                  const isPackaged =
                    product.wholesaleUnit === "bottle" ||
                    product.wholesaleUnit === "can";

                  const hasQuantity =
                    quantity !== undefined &&
                    Number.isInteger(quantity) &&
                    quantity > 0;

                  const boxPrice = isBox
                    ? roundMoney(unitPrice)
                    : isPackaged && hasQuantity
                      ? roundMoney(unitPrice * quantity)
                      : null;

                  const boxWithVat =
                    boxPrice !== null
                      ? roundMoney(boxPrice * (1 + VAT_RATE))
                      : null;

                  const unitLabel = product.wholesaleUnit
                    ? units[product.wholesaleUnit]
                    : priceLabel;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-400/40 transition-colors hover:bg-white/3"
                    >
                      {/* PRODUCT */}
                      <td className="py-6 pr-6 align-middle">
                        {productCell(product, index)}
                      </td>

                      {/* UNIT PRICE */}
                      <td className={tdClass}>
                        {isBox ? (
                          <span className="text-gray-500">—</span>
                        ) : (
                          <div>
                            <span className="whitespace-nowrap text-white">
                              {price(unitPrice, product.currencyCode)}
                            </span>

                            <div className="mt-1 text-xs text-gray-400">
                              {unitLabel}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* QUANTITY */}
                      <td className={tdClass}>
                        {isPackaged && hasQuantity ? quantity : "—"}
                      </td>

                      {/* BOX PRICE */}
                      <td className={tdClass}>
                        {boxPrice !== null ? (
                          <span className="whitespace-nowrap font-medium text-white">
                            {price(boxPrice, product.currencyCode)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* BOX PRICE WITH VAT */}
                      <td className={`${tdClass} text-right`}>
                        {boxWithVat !== null ? (
                          <span className="whitespace-nowrap font-semibold text-yellow-400">
                            {price(boxWithVat, product.currencyCode)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
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
            {labels.kegs}
          </h2>

          <div className="overflow-x-auto">
            <table className={tableClass}>
              <thead>
                <tr className="border-b border-gray-400/70">
                  <th className={`${thClass} w-[30%] pl-0`}>{productLabel}</th>

                  <th className={thClass}>{labels.volume}</th>

                  <th className={thClass}>{labels.material}</th>

                  <th className={thClass}>{labels.literPrice}</th>

                  <th className={thClass}>{labels.kegPrice}</th>

                  <th className={`${thClass} text-right`}>{labels.vat}</th>
                </tr>
              </thead>

              <tbody>
                {kegs.map((product, index) => {
                  const wholesalePrice = Number(product.wholesalePrice);

                  const volume = product.kegVolumeLiters;

                  const hasVolume =
                    volume !== undefined &&
                    Number.isFinite(volume) &&
                    volume > 0;

                  const isPerLiter = product.wholesaleUnit === "liter";

                  const kegPrice = isPerLiter
                    ? hasVolume
                      ? roundMoney(wholesalePrice * volume)
                      : null
                    : roundMoney(wholesalePrice);

                  const literPrice = isPerLiter
                    ? wholesalePrice
                    : hasVolume && kegPrice !== null
                      ? kegPrice / volume
                      : null;

                  const withVat =
                    kegPrice !== null
                      ? roundMoney(kegPrice * (1 + VAT_RATE))
                      : null;

                  const material =
                    product.kegMaterial === "metal"
                      ? labels.metal
                      : product.kegMaterial === "plastic"
                        ? labels.plastic
                        : "—";

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-400/40 transition-colors hover:bg-white/3"
                    >
                      {/* PRODUCT */}
                      <td className="py-6 pr-6 align-middle">
                        {productCell(product, index)}
                      </td>

                      {/* VOLUME */}
                      <td className={tdClass}>
                        {hasVolume ? `${volume} ${labels.literSymbol}` : "—"}
                      </td>

                      {/* MATERIAL */}
                      <td className={tdClass}>{material}</td>

                      {/* PRICE PER LITER */}
                      <td className={tdClass}>
                        {literPrice !== null ? (
                          <span className="whitespace-nowrap text-white">
                            {price(literPrice, product.currencyCode)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* KEG PRICE */}
                      <td className={tdClass}>
                        {kegPrice !== null ? (
                          <span className="whitespace-nowrap font-medium text-white">
                            {price(kegPrice, product.currencyCode)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>

                      {/* KEG PRICE WITH VAT */}
                      <td className={`${tdClass} text-right`}>
                        {withVat !== null ? (
                          <span className="whitespace-nowrap font-semibold text-yellow-400">
                            {price(withVat, product.currencyCode)}
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
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
          className="relative mt-6 flex w-fit items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          {contactLabel}
        </Link>
      </div>
    </section>
  );
}
