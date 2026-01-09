// app/components/Footer.tsx
import Link from "next/link";
import type { SVGProps } from "react";
import type { Locale } from "@/app/lib/locale";
import { getMessages } from "@/app/[lang]/messages";

type FooterProps = { lang: Locale };

const social = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61585569357219",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/craftbear.store",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@craftbybear",
    icon: (props: SVGProps<SVGSVGElement>) => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        {...props}
      >
        <path d="M21 8.06a6.57 6.57 0 0 1-3.78-1.19 6.6 6.6 0 0 1-2.36-3.02h-3.7v11.2a2.73 2.73 0 1 1-2.73-2.73c.26 0 .5.03.74.08V8.67a6.46 6.46 0 0 0-.74-.04A6.43 6.43 0 1 0 12.86 15V10.9A10.3 10.3 0 0 0 21 12.94V8.06z" />
      </svg>
    ),
  },
];

export default async function Footer({ lang }: FooterProps) {
  const messages = await getMessages(lang);
  const t = messages.Footer;

  // используем query параметры вместо динамических сегментов

  const nav = {
    catalog: [
      { key: "bottledBeer", href: `/${lang}/shop?category=beer` },
      { key: "draftBeer", href: `/${lang}/shop?category=draft-beer` },
      { key: "cider", href: `/${lang}/shop?category=cider` },
      { key: "nonAlcoholic", href: `/${lang}/shop?category=non-alcoholic` },
      { key: "snacks", href: `/${lang}/shop?category=snacks` },
      { key: "gifts", href: `/${lang}/shop?category=gifts-sets` },
    ],
    customers: [
      { key: "faq", href: `/${lang}/questions` },
      { key: "shippingPayment", href: `/${lang}/delivery` },

      { key: "cookiePolicy", href: `/${lang}/cookie-policy` },
      { key: "publicOffer", href: `/${lang}/public-offer` },
    ],
    company: [
      { key: "aboutUs", href: `/${lang}/about` },
      { key: "partnership", href: `/${lang}/partnership` },
      { key: "contacts", href: `/${lang}/contact` },
    ],
  } as const;

  return (
    <footer className="mt-6">
      <div className="mx-auto max-w-7xl px-6 py-5 border-t border-gray-400 flex items-center justify-between text-sm text-gray-400">
        <div className="flex gap-12">
          {/* Каталог */}
          <div>
            <h2 className="text-gray-200 pb-4">{t.catalog.title}</h2>
            <ul className="space-y-1">
              {nav.catalog.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="hover:text-yellow-500 transition-colors"
                  >
                    {t.catalog[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Покупателям */}
          <div>
            <h2 className="text-gray-200 pb-4">{t.customers.title}</h2>
            <ul className="space-y-1">
              {nav.customers.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="hover:text-yellow-500 transition-colors"
                  >
                    {t.customers[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Компания + соцсети */}
        <div className="flex flex-col justify-between h-full items-center gap-6">
          <div className="text-center">
            <h2 className="text-gray-200 pb-4">{t.company.title}</h2>
            <ul className="space-y-1">
              {nav.company.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="hover:text-yellow-500 transition-colors"
                  >
                    {t.company[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center gap-y-3">
            <p className="text-sm text-gray-400">{t.followUs}</p>
            <div className="flex justify-center gap-x-6">
              {social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon aria-hidden="true" className="size-6" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 border-t border-gray-700 flex items-center justify-center">
        <div className="gap-3 text-center flex py-6">
          <p className="text-sm text-gray-400">{t.copyright}</p>
          <a
            key="prodused"
            href="https://dvi.digital"
            className="text-gray-200 hover:text-yellow-500 transition-colors text-sm"
            target="_blank"
            rel="noreferrer"
          >
            {t.prodused}
          </a>
        </div>
      </div>
    </footer>
  );
}
