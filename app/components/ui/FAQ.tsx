"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FAQProps = {
  title: string;
  faqs: FaqItem[];
  emptyText?: string;
};

export default function FAQ({ title, faqs, emptyText }: FAQProps) {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-18 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Main page heading */}
          <h1 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          {faqs.length === 0 ? (
            <p className="mt-10 text-base/8 text-gray-400">
              {emptyText ?? "No questions yet."}
            </p>
          ) : (
            <div className="mt-16 divide-y divide-white/10">
              {faqs.map((faq) => (
                <Disclosure
                  key={faq.id}
                  as="div"
                  className="py-6 first:pt-0 last:pb-0"
                >
                  {({ open }) => (
                    <>
                      {/* Question */}
                      <h2>
                        <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                          <span className="text-xl tracking-tight text-white">
                            {faq.question}
                          </span>

                          <span className="ml-6 flex h-7 items-center">
                            {open ? (
                              <MinusSmallIcon
                                aria-hidden="true"
                                className="size-6"
                              />
                            ) : (
                              <PlusSmallIcon
                                aria-hidden="true"
                                className="size-6"
                              />
                            )}
                          </span>
                        </DisclosureButton>
                      </h2>

                      {/* Answer */}
                      <DisclosurePanel className="mt-2 pr-12">
                        <p className="mt-4 text-base/8 text-gray-400">
                          {faq.answer}
                        </p>
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
