import Link from "next/link";
import type { Locale } from "@/app/lib/locale";

export type ContactTranslations = {
  title: string;
  description: string;
  addressTitle: string;
  viewOnMap: string;
  workingHoursTitle: string;
  weekdays: string;
  weekends: string;
  hoursPending: string;
  visitTitle: string;
  visitDescription: string;
  collaborationDescription: string;
  contactButton: string;
};

interface ContactAdressesProps {
  lang: Locale;
  translations: ContactTranslations;
}

export default function ContactAdresses({
  lang,
  translations: t,
}: ContactAdressesProps) {
  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl divide-y divide-white/10 lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-10 py-16 lg:grid-cols-3">
            <div>
              <h1 className="text-pretty text-4xl font-semibold tracking-tight text-white">
                {t.title}
              </h1>

              <p className="mt-4 text-base/7 text-gray-400">{t.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8">
              {/* Address */}
              <div className="rounded-2xl bg-gray-800/50 p-10">
                <h2 className="text-base/7 font-semibold text-white">
                  {t.addressTitle}
                </h2>

                <address className="mt-3 space-y-1 text-sm/6 not-italic text-gray-400">
                  <p>Pärnu maantee 386/2</p>
                  <p>Tallinn, Estonia 11612</p>
                </address>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=P%C3%A4rnu+maantee+386%2F2%2C+Tallinn%2C+Estonia+11612"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex font-semibold text-yellow-500 transition-colors hover:text-yellow-400"
                >
                  {t.viewOnMap} →
                </a>
              </div>

              {/* Working hours */}
              <div className="rounded-2xl bg-gray-800/50 p-10">
                <h2 className="text-base/7 font-semibold text-white">
                  {t.workingHoursTitle}
                </h2>

                <div className="mt-3 space-y-2 text-sm/6 text-gray-400">
                  <p>
                    <span className="font-medium text-gray-300">
                      {t.weekdays}:
                    </span>{" "}
                    {t.hoursPending}
                  </p>

                  <p>
                    <span className="font-medium text-gray-300">
                      {t.weekends}:
                    </span>{" "}
                    {t.hoursPending}
                  </p>
                </div>
              </div>

              {/* Visit / Collaboration */}
              <div className="rounded-2xl bg-gray-800/50 p-10 sm:col-span-2">
                <h2 className="text-base/7 font-semibold text-white">
                  {t.visitTitle}
                </h2>

                <p className="mt-3 max-w-2xl text-sm/6 text-gray-400">
                  {t.visitDescription}
                </p>

                <p className="mt-4 max-w-2xl text-sm/6 text-gray-400">
                  {t.collaborationDescription}
                </p>

                <Link
                  href={`/${lang}/contact`}
                  className="mt-5 inline-flex items-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
                >
                  {t.contactButton}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
