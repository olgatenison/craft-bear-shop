// app/components/ui/ReviewList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";
// import type { Review } from "@/app/lib/supabase";
import { StarIcon } from "@heroicons/react/20/solid";
import EditReviewModal, {
  EditableReview,
} from "@/app/components/EditReviewModal";
import type { LeaveReviewModalText } from "@/app/components/LeaveReviewModal";

type ReviewMessages = {
  title: string;
  empty: string;
  viewProduct: string;
  editReview: string;
};

type ReviewListProps = {
  messages: ReviewMessages;
  lang: Locale;
  modalTexts: LeaveReviewModalText;
};

export default function ReviewList({
  messages,
  lang,
  modalTexts,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<EditableReview[]>([]); // 👈 лучше сразу EditableReview[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<EditableReview | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/account/reviews?lang=${lang}`);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load reviews");
        }

        const data = await res.json();
        setReviews((data.reviews ?? []) as EditableReview[]); // 👈
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchReviews();
  }, [lang]);

  const openEdit = (review: EditableReview) => {
    setEditingReview(review);
    setEditOpen(true);
  };

  return (
    <main className="mt-10 space-y-6 lg:col-span-8 lg:mt-0">
      <div>
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-white">{messages.title}</h1>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {error && !loading && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p className="text-sm text-gray-400">{messages.empty}</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <ul>
            {reviews.map((review) => (
              <li key={review.id} className="py-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
                  {/* левая часть */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-white">
                        {review.product_title ||
                          `Product ${review.shopify_product_id}`}
                      </span>
                      <span className="text-base text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <StarIcon
                          key={i}
                          aria-hidden="true"
                          className={
                            i < review.rating
                              ? "h-5 w-5 text-yellow-400"
                              : "h-5 w-5 text-gray-600"
                          }
                        />
                      ))}
                      <span className="sr-only">{review.rating} out of 5</span>
                    </div>

                    <p className="mt-5 max-w-xl text-base/7 text-gray-300">
                      {review.comment}
                    </p>
                  </div>

                  {/* правая колонка */}
                  <div className="mt-4 flex flex-col justify-between text-sm sm:mt-0 sm:items-end">
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        product ID: {review.shopify_product_id}
                      </span>

                      <button
                        type="button"
                        className="text-sm font-medium text-yellow-400 hover:underline"
                        onClick={() => openEdit(review)}
                      >
                        {messages.editReview}
                      </button>
                    </div>

                    {review.product_handle && (
                      <Link
                        href={`/${lang}/product/${review.product_handle}`}
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-white/10 bg-white/10 px-5 py-2 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                      >
                        {messages.viewProduct}
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <EditReviewModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          review={editingReview}
          texts={modalTexts} // 👈 вот тут вместо reviewModalTexts
          onUpdated={(updated) =>
            setReviews((prev) =>
              prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
            )
          }
        />
      </div>
    </main>
  );
}
