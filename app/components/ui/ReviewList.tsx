// app/components/ui/ReviewList.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";
import type { Review } from "@/app/lib/supabase";
import { StarIcon } from "@heroicons/react/20/solid";

type ReviewMessages = {
  title: string;
  empty: string;
  viewProduct: string;
  editReview: string;
};

type ReviewListProps = {
  messages: ReviewMessages;
  lang: Locale;
};

export default function ReviewList({ messages, lang }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/account/reviews?lang=${lang}`);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load reviews");
        }

        const data = await res.json();
        setReviews(data.reviews ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchReviews();
  }, [lang]);

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
          <ul className="divide-y divide-gray-800 rounded-xl border border-gray-800 bg-black/30">
            {reviews.map((review) => (
              <li key={review.id} className="p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {review.product_title ||
                          `Product ${review.shopify_product_id}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1">
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

                    <p className="mt-3 text-sm text-gray-300">
                      {review.comment}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col items-start gap-2 text-sm sm:mt-0 sm:items-end">
                    <span className="text-xs text-gray-500">
                      product ID: {review.shopify_product_id}
                    </span>

                    {review.product_handle && (
                      <Link
                        href={`/${lang}/product/${review.product_handle}`}
                        className="text-sm font-medium text-yellow-400 hover:underline"
                      >
                        {messages.viewProduct}
                      </Link>
                    )}

                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-gray-200"
                      disabled
                    >
                      {messages.editReview}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
