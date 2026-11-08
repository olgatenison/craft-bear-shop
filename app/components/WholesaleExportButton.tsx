"use client";

import { useState } from "react";

import type {
  WholesaleProduct,
  WholesaleTableTranslations,
  WholesaleUnit,
} from "./WholesaleContent";

type Props = {
  lang: string;
  products: WholesaleProduct[];
  labels: WholesaleTableTranslations;
  units: Record<WholesaleUnit, string>;
  productLabel: string;
};

const VAT_RATE = 0.24;

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isKegProduct(product: WholesaleProduct): boolean {
  return (
    product.wholesaleUnit === "keg" ||
    (product.wholesaleUnit === "liter" &&
      product.kegVolumeLiters !== undefined &&
      product.kegVolumeLiters > 0)
  );
}

function styleSheet(sheet: import("exceljs").Worksheet) {
  sheet.views = [
    {
      state: "frozen",
      ySplit: 1,
    },
  ];

  const headerRow = sheet.getRow(1);

  headerRow.height = 32;

  headerRow.eachCell((cell: import("exceljs").Cell) => {
    cell.font = {
      bold: true,
      color: {
        argb: "FF111111",
      },
    };

    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FFFACC15",
      },
    };

    cell.alignment = {
      vertical: "middle",
      wrapText: true,
    };
  });

  sheet.autoFilter = {
    from: {
      row: 1,
      column: 1,
    },
    to: {
      row: Math.max(1, sheet.rowCount),
      column: sheet.columnCount,
    },
  };

  sheet.eachRow((row: import("exceljs").Row, rowIndex: number) => {
    if (rowIndex === 1) return;

    row.height = 24;

    row.eachCell((cell: import("exceljs").Cell) => {
      cell.alignment = {
        vertical: "middle",
      };

      if (typeof cell.value === "number") {
        cell.numFmt = "#,##0.00";
      }
    });
  });
}

export default function WholesaleExportButton({
  lang,
  products,
  labels,
  productLabel,
}: Props) {
  const [loading, setLoading] = useState(false);

  const buttonText: Record<string, string> = {
    uk: "Завантажити прайс",
    ru: "Скачать прайс",
    en: "Download price list",
    et: "Laadi hinnakiri alla",
    fi: "Lataa hinnasto",
  };

  const errorText: Record<string, string> = {
    uk: "Не вдалося створити Excel-файл.",
    ru: "Не удалось создать Excel-файл.",
    en: "Failed to generate Excel file.",
    et: "Exceli faili loomine ebaõnnestus.",
    fi: "Excel-tiedoston luominen epäonnistui.",
  };

  async function handleDownload() {
    if (loading || products.length === 0) return;

    setLoading(true);

    try {
      const ExcelJS = (await import("exceljs")).default;

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "Craft Bear";
      workbook.created = new Date();

      const bottles = products.filter((product) => !isKegProduct(product));

      const kegs = products.filter(isKegProduct);

      // -----------------------------------------
      // BOTTLES AND CANS
      // -----------------------------------------

      if (bottles.length > 0) {
        const sheet = workbook.addWorksheet(labels.bottles);

        sheet.columns = [
          {
            header: productLabel,
            key: "product",
            width: 45,
          },
          {
            header: labels.unitPrice,
            key: "unitPrice",
            width: 20,
          },
          {
            header: labels.quantity,
            key: "quantity",
            width: 18,
          },
          {
            header: labels.boxPrice,
            key: "boxPrice",
            width: 22,
          },
          {
            header: labels.vat,
            key: "withVat",
            width: 22,
          },
          {
            header: "Currency",
            key: "currency",
            width: 12,
          },
        ];

        bottles.forEach((product) => {
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
              ? roundMoney(unitPrice * quantity!)
              : null;

          const withVat =
            boxPrice !== null ? roundMoney(boxPrice * (1 + VAT_RATE)) : null;

          sheet.addRow({
            product: product.title,
            unitPrice: isBox ? null : unitPrice,
            quantity: isPackaged && hasQuantity ? quantity : null,
            boxPrice,
            withVat,
            currency: product.currencyCode,
          });
        });

        styleSheet(sheet);
      }

      // -----------------------------------------
      // KEGS
      // -----------------------------------------

      if (kegs.length > 0) {
        const sheet = workbook.addWorksheet(labels.kegs);

        sheet.columns = [
          {
            header: productLabel,
            key: "product",
            width: 45,
          },
          {
            header: labels.volume,
            key: "volume",
            width: 18,
          },
          {
            header: labels.material,
            key: "material",
            width: 18,
          },
          {
            header: labels.literPrice,
            key: "literPrice",
            width: 20,
          },
          {
            header: labels.kegPrice,
            key: "kegPrice",
            width: 20,
          },
          {
            header: labels.vat,
            key: "withVat",
            width: 20,
          },
          {
            header: "Currency",
            key: "currency",
            width: 12,
          },
        ];

        kegs.forEach((product) => {
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

          const material =
            product.kegMaterial === "metal"
              ? labels.metal
              : product.kegMaterial === "plastic"
                ? labels.plastic
                : "";

          sheet.addRow({
            product: product.title,
            volume: hasVolume ? volume : null,
            material,
            literPrice,
            kegPrice,
            withVat,
            currency: product.currencyCode,
          });
        });

        styleSheet(sheet);
      }

      // -----------------------------------------
      // DOWNLOAD EXCEL
      // -----------------------------------------

      if (workbook.worksheets.length === 0) {
        return;
      }

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([new Uint8Array(buffer)], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `Craft-Bear-Wholesale-${lang}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Excel export failed:", error);

      alert(errorText[lang] ?? errorText.en);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading || products.length === 0}
      className="
        inline-flex
        min-h-11
        shrink-0
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-yellow-400/30
        bg-yellow-400
        px-5
        py-3
        text-sm
        font-semibold
        text-black
        transition-colors
        hover:bg-yellow-300
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 17v3h14v-3" />
      </svg>

      {loading ? "..." : `${buttonText[lang] ?? buttonText.en} XLSX`}
    </button>
  );
}
