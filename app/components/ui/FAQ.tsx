// import {
//   Disclosure,
//   DisclosureButton,
//   DisclosurePanel,
// } from "@headlessui/react";
// import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

// const faqs = [
//   {
//     question: "What's the best thing about Switzerland?",
//     answer:
//       "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
//   },
//   {
//     question: "How do you make holy water?",
//     answer:
//       "You boil the hell out of it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam aut tempora vitae odio inventore fuga aliquam nostrum quod porro. Delectus quia facere id sequi expedita natus.",
//   },
//   {
//     question: "What do you call someone with no body and no nose?",
//     answer:
//       "Nobody knows. Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa, voluptas ipsa quia excepturi, quibusdam natus exercitationem sapiente tempore labore voluptatem.",
//   },
//   {
//     question: "Why do you never see elephants hiding in trees?",
//     answer:
//       "Because they're so good at it. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
//   },
//   {
//     question: "Why can't you hear a pterodactyl go to the bathroom?",
//     answer:
//       "Because the pee is silent. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsam, quas voluptatibus ex culpa ipsum, aspernatur blanditiis fugiat ullam magnam suscipit deserunt illum natus facilis atque vero consequatur! Quisquam, debitis error.",
//   },
//   {
//     question: "Why did the invisible man turn down the job offer?",
//     answer:
//       "He couldn't see himself doing it. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eveniet perspiciatis officiis corrupti tenetur. Temporibus ut voluptatibus, perferendis sed unde rerum deserunt eius.",
//   },
// ];

// export default function FAQ() {
//   return (
//     <div className="">
//       <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 ">
//         <div className="mx-auto max-w-4xl">
//           <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
//             Frequently asked questions
//           </h2>
//           <dl className="mt-16 divide-y divide-white/10">
//             {faqs.map((faq) => (
//               <Disclosure
//                 key={faq.question}
//                 as="div"
//                 className="py-6 first:pt-0 last:pb-0"
//               >
//                 <dt>
//                   <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
//                     <span className="text-xl tracking-tight text-white">
//                       {faq.question}
//                     </span>
//                     <span className="ml-6 flex h-7 items-center">
//                       <PlusSmallIcon
//                         aria-hidden="true"
//                         className="size-6 group-data-[open]:hidden"
//                       />
//                       <MinusSmallIcon
//                         aria-hidden="true"
//                         className="size-6 group-[:not([data-open])]:hidden"
//                       />
//                     </span>
//                   </DisclosureButton>
//                 </dt>
//                 <DisclosurePanel as="dd" className="mt-2 pr-12">
//                   <p className="mt-4 text-base/8 text-gray-400">{faq.answer}</p>
//                 </DisclosurePanel>
//               </Disclosure>
//             ))}
//           </dl>
//         </div>
//       </div>
//     </div>
//   );
// }
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

export default function FAQ({
  title,
  faqs,
  emptyText,
}: {
  title: string;
  faqs: FaqItem[];
  emptyText?: string;
}) {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>

          {faqs.length === 0 ? (
            <p className="mt-10 text-base/8 text-gray-400">
              {emptyText ?? "No questions yet."}
            </p>
          ) : (
            <dl className="mt-16 divide-y divide-white/10">
              {faqs.map((faq) => (
                <Disclosure
                  key={faq.id}
                  as="div"
                  className="py-6 first:pt-0 last:pb-0"
                >
                  <dt>
                    <DisclosureButton className="group flex w-full items-start justify-between text-left text-white">
                      <span className="text-xl tracking-tight text-white">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <PlusSmallIcon
                          aria-hidden="true"
                          className="size-6 group-data-open:hidden"
                        />
                        <MinusSmallIcon
                          aria-hidden="true"
                          className="size-6 group-[:not([data-open])]:hidden"
                        />
                      </span>
                    </DisclosureButton>
                  </dt>

                  <DisclosurePanel as="dd" className="mt-2 pr-12">
                    <p className="mt-4 text-base/8 text-gray-400">
                      {faq.answer}
                    </p>
                  </DisclosurePanel>
                </Disclosure>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
