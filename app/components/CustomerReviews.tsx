// app/components/CustomerReviews.tsx
"use client";

import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LeaveReviewModal, {
  type LeaveReviewModalText,
} from "./LeaveReviewModal";
import type { Locale } from "@/app/lib/locale";

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

type RatingCount = {
  rating: 1 | 2 | 3 | 4 | 5;
  count: number;
};

type FeaturedReview = {
  id: string | number;
  rating: number;
  content: string;
  author: string;
};

export type ReviewsData = {
  average: number;
  totalCount: number;
  counts: RatingCount[];
  featured: FeaturedReview[];
};

type CustomerReviewsProps = {
  lang: Locale;
  title: string;
  stars: string;
  base1: string;
  base2: string;
  starRew: string;
  CTATitle: string;
  CTASubtitle: string;
  button: string;
  recentReviews: string;
  reviews: ReviewsData;
  productExternalId: string; // Shopify numeric id
  loginToReview: string; // 👈 из переводов
  modalTexts: LeaveReviewModalText; // 👈 тексты для модалки
};

export default function CustomerReviews({
  lang,
  title,
  stars,
  base1,
  base2,
  starRew,
  CTATitle,
  CTASubtitle,
  button,
  recentReviews,
  reviews,
  productExternalId,
  loginToReview,
  modalTexts,
}: CustomerReviewsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSignInClick = () => {
    router.push(`/${lang}/account`);
  };

  return (
    <div>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-32">
        {/* left */}
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h2>

          <div className="mt-3 flex items-center">
            <div>
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((r) => (
                  <StarIcon
                    key={r}
                    aria-hidden="true"
                    className={classNames(
                      reviews.average > r ? "text-yellow-400" : "text-gray-500",
                      "size-5 shrink-0"
                    )}
                  />
                ))}
              </div>
              <p className="sr-only">
                {reviews.average} out of 5 {stars}
              </p>
            </div>
            <p className="ml-2 text-sm text-gray-400">
              {base1} {reviews.totalCount} {base2}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Review data</h3>
            <dl className="space-y-3">
              {reviews.counts.map((count) => {
                const percent =
                  reviews.totalCount > 0
                    ? Math.round((count.count / reviews.totalCount) * 100)
                    : 0;
                return (
                  <div key={count.rating} className="flex items-center text-sm">
                    <dt className="flex flex-1 items-center">
                      <p className="w-3 font-medium text-white">
                        {count.rating}
                        <span className="sr-only"> {starRew}</span>
                      </p>
                      <div
                        aria-hidden="true"
                        className="ml-1 flex flex-1 items-center"
                      >
                        <StarIcon
                          aria-hidden="true"
                          className={classNames(
                            count.count > 0
                              ? "text-yellow-400"
                              : "text-gray-500",
                            "size-5 shrink-0"
                          )}
                        />
                        <div className="relative ml-3 flex-1">
                          {count.count > 0 ? (
                            <div className="h-3 rounded-full border border-gray-700 bg-gray-800">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-3 rounded-full border border-yellow-400 bg-yellow-400"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </dt>
                    <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-400">
                      {percent}%
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-medium text-white">{CTATitle}</h3>
            <p className="mt-1 text-sm text-gray-400">{CTASubtitle}</p>

            {/* если не залогинен */}
            <SignedOut>
              <button
                onClick={handleSignInClick}
                className="mt-10 relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {loginToReview}
              </button>
            </SignedOut>

            {/* если залогинен */}
            <SignedIn>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-10 relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {button}
              </button>
            </SignedIn>
          </div>
        </div>

        {/* right */}
        <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
          <h3 className="sr-only">{recentReviews}</h3>
          <div className="flow-root">
            <div className="-my-12 divide-y divide-gray-700">
              {reviews.featured.map((review) => (
                <div key={review.id} className="py-12">
                  <div className="flex items-center">
                    <div>
                      <h4 className="font-bold text-white">{review.author}</h4>
                      <div className="mt-1 flex items-center">
                        {[0, 1, 2, 3, 4].map((r) => (
                          <StarIcon
                            key={r}
                            aria-hidden="true"
                            className={classNames(
                              review.rating > r
                                ? "text-yellow-400"
                                : "text-gray-500",
                              "size-5 shrink-0"
                            )}
                          />
                        ))}
                      </div>
                      <p className="sr-only">{review.rating} out of 5 stars</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-6 text-base italic text-gray-300">
                    {review.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* одна модалка на весь компонент */}
      <LeaveReviewModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productExternalId={productExternalId}
        texts={modalTexts}
      />
    </div>
  );
}

// // app/components/CustomerReviews.tsx
// "use client";

// import { useState } from "react";
// import { StarIcon } from "@heroicons/react/20/solid";
// import { SignedIn, SignedOut } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import LeaveReviewModal from "./LeaveReviewModal";
// import type { Locale } from "@/app/lib/locale";
// import { LeaveReviewModalText } from "./LeaveReviewModal";

// function classNames(...classes: (string | undefined | null | false)[]): string {
//   return classes.filter(Boolean).join(" ");
// }

// // ----- типы -----
// type RatingCount = {
//   rating: 1 | 2 | 3 | 4 | 5;
//   count: number;
// };

// type FeaturedReview = {
//   id: string | number;
//   rating: number;
//   content: string;
//   author: string;
// };

// export type ReviewsData = {
//   average: number;
//   totalCount: number;
//   counts: RatingCount[];
//   featured: FeaturedReview[];
// };

// type CustomerReviewsProps = {
//   lang: Locale;
//   title: string;
//   stars: string;
//   base1: string;
//   base2: string;
//   starRew: string;
//   CTATitle: string;
//   CTASubtitle: string;
//   button: string;
//   loginToReview: string;
//   recentReviews: string;
//   reviews: ReviewsData;
//   modalTexts: LeaveReviewModalText;
//   productExternalId: string; // Shopify numeric id
// };

// // -----------------------

// export default function CustomerReviews({
//   lang,
//   title,
//   stars,
//   base1,
//   base2,
//   starRew,
//   CTATitle,
//   CTASubtitle,
//   button,
//   loginToReview,
//   recentReviews,
//   reviews,
//   modalTexts,
//   productExternalId,
// }: CustomerReviewsProps) {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const router = useRouter();

//   const handleSignInClick = () => {
//     router.push(`/${lang}/account`);
//   };

//   return (
//     <div className="border-t border-gray-300 pt-16">
//       <div className="mx-auto max-w-2xl pb-8 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 l">
//         {/* left */}
//         <div className="lg:col-span-4">
//           <h2 className="text-2xl font-bold tracking-tight text-white">
//             {title}
//           </h2>

//           <div className="mt-3 flex items-center">
//             <div>
//               <div className="flex items-center">
//                 {[0, 1, 2, 3, 4].map((r) => (
//                   <StarIcon
//                     key={r}
//                     aria-hidden="true"
//                     className={classNames(
//                       reviews.average > r ? "text-yellow-400" : "text-gray-500",
//                       "size-5 shrink-0"
//                     )}
//                   />
//                 ))}
//               </div>
//               <p className="sr-only">
//                 {reviews.average} out of 5 {stars}
//               </p>
//             </div>
//             <p className="ml-2 text-sm text-gray-400">
//               {base1} {reviews.totalCount} {base2}
//             </p>
//           </div>

//           <div className="mt-6">
//             <h3 className="sr-only">Review data</h3>
//             <dl className="space-y-3">
//               {reviews.counts.map((count) => {
//                 const percent =
//                   reviews.totalCount > 0
//                     ? Math.round((count.count / reviews.totalCount) * 100)
//                     : 0;
//                 return (
//                   <div key={count.rating} className="flex items-center text-sm">
//                     <dt className="flex flex-1 items-center">
//                       <p className="w-3 font-medium text-white">
//                         {count.rating}
//                         <span className="sr-only"> {starRew}</span>
//                       </p>
//                       <div
//                         aria-hidden="true"
//                         className="ml-1 flex flex-1 items-center"
//                       >
//                         <StarIcon
//                           aria-hidden="true"
//                           className={classNames(
//                             count.count > 0
//                               ? "text-yellow-400"
//                               : "text-gray-500",
//                             "size-5 shrink-0"
//                           )}
//                         />
//                         <div className="relative ml-3 flex-1">
//                           {count.count > 0 ? (
//                             <div className="h-3 rounded-full border border-gray-700 bg-gray-800">
//                               <div
//                                 style={{ width: `${percent}%` }}
//                                 className="h-3 rounded-full border border-yellow-400 bg-yellow-400"
//                               />
//                             </div>
//                           ) : null}
//                         </div>
//                       </div>
//                     </dt>
//                     <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-400">
//                       {percent}%
//                     </dd>
//                   </div>
//                 );
//               })}
//             </dl>
//           </div>

//           <div className="mt-10">
//             <h3 className="text-lg font-medium text-white">{CTATitle}</h3>
//             <p className="mt-1 text-sm text-gray-400">{CTASubtitle}</p>

//             {/* Если не залогинен — показываем кнопку перехода на sign-in */}
//             <SignedOut>
//               <button
//                 onClick={handleSignInClick}
//                 className="mt-10 relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-full"
//               >
//                 {loginToReview}
//               </button>
//             </SignedOut>

//             {/* Если залогинен — открываем нашу модалку */}
//             <SignedIn>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="mt-10 w-full relative flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-8 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 "
//               >
//                 {button}
//               </button>
//             </SignedIn>

//             <LeaveReviewModal
//               open={isModalOpen}
//               onClose={() => setIsModalOpen(false)}
//               productExternalId={productExternalId}
//               texts={modalTexts}
//             />
//           </div>
//         </div>

//         {/* right */}
//         <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
//           <h3 className="sr-only">{recentReviews}</h3>
//           <div className="flow-root">
//             <div className="-my-12 divide-y divide-gray-700">
//               {reviews.featured.map((review) => (
//                 <div
//                   key={review.id}
//                   className="py-10 border-b border-gray-200 "
//                 >
//                   <div className="flex items-center">
//                     <div>
//                       <h4 className="font-bold text-white">{review.author}</h4>
//                       <div className="mt-6 flex items-center">
//                         {[0, 1, 2, 3, 4].map((r) => (
//                           <StarIcon
//                             key={r}
//                             aria-hidden="true"
//                             className={classNames(
//                               review.rating > r
//                                 ? "text-yellow-400"
//                                 : "text-gray-500",
//                               "size-5 shrink-0"
//                             )}
//                           />
//                         ))}
//                       </div>
//                       <p className="sr-only">{review.rating} out of 5 stars</p>
//                     </div>
//                   </div>
//                   <div className="mt-4 space-y-6 text-base text-gray-300 ">
//                     {review.content}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <LeaveReviewModal
//           open={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//           productExternalId={productExternalId}
//           texts={modalTexts}
//         />
//       </div>
//     </div>
//   );
// }
