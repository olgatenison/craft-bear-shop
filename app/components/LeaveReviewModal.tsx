// app/components/LeaveReviewModal.tsx
"use client";

import { useState, FormEvent } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { useUser } from "@clerk/nextjs";

function classNames(...classes: Array<string | null | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type LeaveReviewModalText = {
  title: string;
  loading: string;
  mustLogin: string;
  noEmail: string;
  fillRequired: string;
  success: string;
  ratingLabel: string;
  nameLabel: string;
  emailLabel: string;
  reviewLabel: string;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel: string;
};

type LeaveReviewModalProps = {
  open: boolean;
  onClose: () => void;
  productExternalId: string; // Shopify product id
  texts: LeaveReviewModalText;
};

export default function LeaveReviewModal({
  open,
  onClose,
  productExternalId,
  texts,
}: LeaveReviewModalProps) {
  const { user, isLoaded } = useUser();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const name =
    user?.fullName ||
    (user?.firstName &&
      user.firstName + (user.lastName ? ` ${user.lastName}` : "")) ||
    "";
  const email = user?.primaryEmailAddress?.emailAddress || "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isLoaded || !user) {
      setError(texts.mustLogin);
      return;
    }

    if (!email) {
      setError(texts.noEmail);
      return;
    }

    if (!rating || !body.trim()) {
      setError(texts.fillRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopify_product_id: productExternalId,
          rating,
          comment: body.trim(),
          user_name: name || "User",
          user_email: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(texts.success);
      setBody("");
      setRating(5);
      setHoverRating(null);

      setTimeout(() => {
        setSuccess(null);
        onClose();
        // Перезагружаем страницу, чтобы показать новый отзыв
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : texts.fillRequired;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-20">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">{texts.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {!isLoaded ? (
          <p className="mt-10 text-sm text-gray-300">{texts.loading}</p>
        ) : !user ? (
          <p className="mt-4 text-sm text-red-400">{texts.mustLogin}</p>
        ) : (
          <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-400">
                {texts.ratingLabel}
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating
                    ? star <= hoverRating
                    : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-0.5"
                    >
                      <StarIcon
                        className={classNames(
                          active ? "text-yellow-400" : "text-gray-500",
                          "size-6"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Readonly user info */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 text-sm">
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-400">
                  {texts.nameLabel}
                </span>
                <p className="mt-2 w-full border-b border-gray-400/50 bg-transparent pb-1 text-base text-white outline-none">
                  {name || "User"}
                </p>
              </div>
              <div>
                <span className="mb-1 block text-sm font-medium text-gray-400">
                  {texts.emailLabel}
                </span>
                <p className="mt-2 w-full border-b border-gray-400/50 bg-transparent pb-1 text-base text-white outline-none">
                  {email}
                </p>
              </div>
            </div>

            {/* Text */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {texts.reviewLabel}
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-4  text-white outline-none focus:border-white/40 text-base/7"
                required
                minLength={10}
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-base font-semibold text-gray-900 duration-300 hover:border-yellow-600 hover:bg-yellow-500 sm:w-auto lg:w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? texts.submittingLabel : texts.submitLabel}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex shrink-0 items-center justify-center rounded-md border border-white/25 px-8 py-2 text-base font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {texts.cancelLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// // app/components/LeaveReviewModal.tsx
// "use client";

// import { useState, FormEvent } from "react";
// import { StarIcon } from "@heroicons/react/20/solid";
// import { useUser } from "@clerk/nextjs";

// function classNames(...classes: Array<string | null | undefined | false>) {
//   return classes.filter(Boolean).join(" ");
// }

// // все строки, которые должны быть переведены
// export type LeaveReviewModalText = {
//   title: string;
//   loading: string;
//   mustLogin: string;
//   noEmail: string;
//   fillRequired: string;
//   success: string;
//   ratingLabel: string;
//   nameLabel: string;
//   emailLabel: string;
//   reviewLabel: string;
//   submitLabel: string;
//   submittingLabel: string;
//   cancelLabel: string;
// };

// type LeaveReviewModalProps = {
//   open: boolean;
//   onClose: () => void;
//   productExternalId: string; // Shopify numeric id
//   texts: LeaveReviewModalText;
// };

// export default function LeaveReviewModal({
//   open,
//   onClose,
//   productExternalId,
//   texts,
// }: LeaveReviewModalProps) {
//   const { user, isLoaded } = useUser();

//   const [rating, setRating] = useState<number>(5);
//   const [hoverRating, setHoverRating] = useState<number | null>(null);
//   const [body, setBody] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   if (!open) return null;

//   const name =
//     user?.fullName ||
//     (user?.firstName &&
//       user.firstName + (user.lastName ? ` ${user.lastName}` : "")) ||
//     "";
//   const email = user?.primaryEmailAddress?.emailAddress || "";

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!isLoaded || !user) {
//       setError(texts.mustLogin);
//       return;
//     }

//     if (!email) {
//       setError(texts.noEmail);
//       return;
//     }

//     if (!rating || !body.trim()) {
//       setError(texts.fillRequired);
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const res = await fetch("/api/judgeme/review", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           rating,
//           body: body.trim(),
//           reviewer_name: name || "User",
//           reviewer_email: email,
//           product_external_id: productExternalId,
//         }),
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => ({}));
//         throw new Error(data.error || texts.fillRequired);
//       }

//       setSuccess(texts.success);
//       setBody("");
//       setRating(5);
//       setHoverRating(null);

//       setTimeout(() => {
//         setSuccess(null);
//         onClose();
//       }, 1200);
//     } catch (err: any) {
//       setError(err.message || texts.fillRequired);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-20">
//       <div className="w-full max-w-lg rounded-2xl bg-neutral-900 p-6 shadow-xl">
//         <div className="flex items-start justify-between gap-4">
//           <h3 className="text-xl font-semibold text-white">{texts.title}</h3>
//           <button
//             type="button"
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-200"
//           >
//             ✕
//           </button>
//         </div>

//         {!isLoaded ? (
//           <p className="mt-10 text-sm text-gray-300">{texts.loading}</p>
//         ) : !user ? (
//           <p className="mt-4 text-sm text-red-400">{texts.mustLogin}</p>
//         ) : (
//           <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
//             {/* Rating */}
//             <div className="flex items-center gap-4">
//               <label className="text-sm font-medium text-gray-400">
//                 {texts.ratingLabel}
//               </label>
//               <div className="flex items-center gap-1">
//                 {[1, 2, 3, 4, 5].map((star) => {
//                   const active = hoverRating
//                     ? star <= hoverRating
//                     : star <= rating;
//                   return (
//                     <button
//                       key={star}
//                       type="button"
//                       onMouseEnter={() => setHoverRating(star)}
//                       onMouseLeave={() => setHoverRating(null)}
//                       onClick={() => setRating(star)}
//                       className="p-0.5"
//                     >
//                       <StarIcon
//                         className={classNames(
//                           active ? "text-yellow-400" : "text-gray-500",
//                           "size-6"
//                         )}
//                       />
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Readonly user info */}
//             <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 text-sm">
//               <div>
//                 <span className="mb-1 block text-sm font-medium text-gray-400">
//                   {texts.nameLabel}
//                 </span>
//                 <p className="mt-2 w-full border-b border-gray-400/50 bg-transparent pb-1 text-base text-white outline-none">
//                   {name || "User"}
//                 </p>
//               </div>
//               <div>
//                 <span className="mb-1 block text-sm font-medium text-gray-400">
//                   {texts.emailLabel}
//                 </span>
//                 <p className="mt-2 w-full border-b border-gray-400/50 bg-transparent pb-1 text-base text-white outline-none">
//                   {email}
//                 </p>
//               </div>
//             </div>

//             {/* Text */}
//             <div>
//               <label className="mb-2 block text-sm font-medium text-gray-400">
//                 {texts.reviewLabel}
//               </label>
//               <textarea
//                 value={body}
//                 onChange={(e) => setBody(e.target.value)}
//                 rows={8}
//                 className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-4  text-white outline-none focus:border-white/40 text-base/7"
//                 required
//               />
//             </div>

//             {error && <p className="text-sm text-red-400">{error}</p>}
//             {success && <p className="text-sm text-green-400">{success}</p>}

//             <div className="mt-4 flex justify-end gap-3">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-base font-semibold text-gray-900 duration-300 hover:border-yellow-600 hover:bg-yellow-500 sm:w-auto lg:w-full"
//               >
//                 {isSubmitting ? texts.submittingLabel : texts.submitLabel}
//               </button>
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="inline-flex shrink-0 items-center justify-center rounded-md border border-white/25 px-8 py-2 text-base font-semibold text-white hover:bg-white/10 disabled:opacity-60"
//                 disabled={isSubmitting}
//               >
//                 {texts.cancelLabel}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }
