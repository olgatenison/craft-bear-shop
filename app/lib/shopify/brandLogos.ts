import type { Locale } from "@/app/lib/locale";
import { shopifyFetchWithLocale } from "@/app/lib/shopify/client";

export type BrandItem = {
  id: string;
  name: string;
  logo: string; // URL (cdn.shopify.com)
  order: number;
};

const langMap: Record<Locale, string> = {
  en: "EN",
  et: "ET",
  fi: "FI",
  uk: "UK",
  ru: "RU",
};

type MediaImageRef = {
  __typename: "MediaImage";
  image: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

type GenericFileRef = {
  __typename: "GenericFile";
  url: string;
};

type FieldReference = MediaImageRef | GenericFileRef;

type MetaobjectField = {
  key: string;
  value: string | null;
  reference: FieldReference | null;
};

type MetaobjectNode = {
  id: string;
  fields: MetaobjectField[];
};

type BrandLogosResponse = {
  metaobjects: {
    nodes: MetaobjectNode[];
  };
};

const BRAND_LOGOS_QUERY = `#graphql
query BrandLogos($lang: LanguageCode!) @inContext(language: $lang) {
  metaobjects(type: "brand_logo", first: 50) {
    nodes {
      id
      fields {
        key
        value
        reference {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            url
          }
        }
      }
    }
  }
}
`;

function isMediaImageRef(ref: FieldReference | null): ref is MediaImageRef {
  return !!ref && ref.__typename === "MediaImage";
}

function isGenericFileRef(ref: FieldReference | null): ref is GenericFileRef {
  return !!ref && ref.__typename === "GenericFile";
}

function fieldsToMap(fields: MetaobjectField[]) {
  const out: Record<
    string,
    { value: string; reference: FieldReference | null }
  > = {};
  for (const f of fields) {
    out[f.key] = { value: f.value ?? "", reference: f.reference ?? null };
  }
  return out;
}

export async function getBrandLogos(lang: Locale): Promise<BrandItem[]> {
  // ⬇️ У ТЕБЯ shopifyFetchWithLocale требует 3-4 аргумента
  // третий — обычно сам locale (lang). Если у тебя иначе — скажи, адаптирую 1:1.
  const data = await shopifyFetchWithLocale<BrandLogosResponse>(
    BRAND_LOGOS_QUERY,
    { lang: langMap[lang] },
    lang
  );

  const nodes = data?.metaobjects?.nodes ?? [];

  const items: BrandItem[] = nodes
    .map((n) => {
      const f = fieldsToMap(n.fields);

      const name = f.name?.value?.trim() ?? "";
      const order = Number(f.order?.value ?? 0);

      const logoRef = f.logo?.reference ?? null;

      const logo =
        (isMediaImageRef(logoRef) && logoRef.image?.url) ||
        (isGenericFileRef(logoRef) && logoRef.url) ||
        "";

      if (!name || !logo) return null;

      return {
        id: n.id,
        name,
        logo,
        order,
      };
    })
    .filter((x): x is BrandItem => x !== null)
    .sort((a, b) => a.order - b.order);

  return items;
}
