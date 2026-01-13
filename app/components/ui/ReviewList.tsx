// app/components/ui/ReviewList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/app/lib/locale";
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
  deleteReview: string;
  deleteConfirm: string;
  deleting: string;
  page: string;
  of: string;
  showing: string;
  prev: string;
  next: string;
};

type ReviewListProps = {
  messages: ReviewMessages;
  lang: Locale;
  modalTexts: LeaveReviewModalText;
};

type ReviewsApiResponse = {
  reviews: EditableReview[];
  page: number;
  limit: number;
  total: number;
};

export default function ReviewList({
  messages,
  lang,
  modalTexts,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<EditableReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingReview, setEditingReview] = useState<EditableReview | null>(
    null
  );
  const [editOpen, setEditOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const limit = 5;

  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  useEffect(() => {
    setPage(1);
  }, [lang]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const qs = new URLSearchParams({
          lang,
          page: String(page),
          limit: String(limit),
        });

        const res = await fetch(`/api/account/reviews?${qs.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load reviews");
        }

        const data = (await res.json()) as ReviewsApiResponse;

        setReviews((data.reviews ?? []) as EditableReview[]);
        setTotal(Number(data.total ?? 0));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchReviews();
    return () => controller.abort();
  }, [lang, page]);

  const openEdit = (review: EditableReview) => {
    setEditingReview(review);
    setEditOpen(true);
  };

  const handleReviewUpdated = (updated: EditableReview) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === updated.id) {
          return {
            ...updated,
            product_handle: r.product_handle,
            product_title: r.product_title,
          };
        }
        return r;
      })
    );
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm(messages.deleteConfirm)) return;

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/account/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete review");
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setTotal((t) => Math.max(0, t - 1));

      const willBeEmpty = reviews.length === 1;
      if (willBeEmpty && page > 1) {
        setPage((p) => p - 1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      alert(`Error: ${message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="mt-10 space-y-6 lg:col-span-8 lg:mt-0">
      <div>
        <div className="mb-8 flex items-center justify-between gap-4 sm:flex-row flex-col">
          <h1 className="text-xl font-semibold text-white">{messages.title}</h1>

          {/* ✅ Pagination controls with translations */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {total > 0
                ? `${messages.page} ${page} ${messages.of} ${totalPages}`
                : ""}
            </span>

            <button
              type="button"
              className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loading || page <= 1}
            >
              {messages.prev}
            </button>

            <button
              type="button"
              className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={loading || page >= totalPages}
            >
              {messages.next}
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-400">Loading...</p>}

        {error && !loading && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && total === 0 && (
          <p className="mt-4 text-base text-gray-400">{messages.empty}</p>
        )}

        {!loading && !error && reviews.length > 0 && (
          <>
            <ul>
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="pt-6 pb-10 border-b border-gray-400/50"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:justify-between">
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
                        <span className="sr-only">
                          {review.rating} out of 5
                        </span>
                      </div>

                      <p className="mt-5 max-w-xl text-base/7 text-gray-300">
                        {review.comment}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col justify-between text-sm sm:mt-0 sm:items-end">
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">
                          product ID: {review.shopify_product_id}
                        </span>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="text-sm font-medium text-yellow-400 hover:underline"
                            onClick={() => openEdit(review)}
                          >
                            {messages.editReview}
                          </button>

                          <button
                            type="button"
                            className="text-sm font-medium text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteReview(review.id)}
                            disabled={deletingId === review.id}
                          >
                            {deletingId === review.id
                              ? messages.deleting
                              : messages.deleteReview}
                          </button>
                        </div>
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

            {/* ✅ Bottom pagination with translations */}
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 sm:flex-row flex-col">
              <span className="sm:mb-0 mb-6 text-sm text-gray-400">
                {total > 0
                  ? `${messages.showing} ${(page - 1) * limit + 1}-${
                      (page - 1) * limit + reviews.length
                    } ${messages.of} ${total}`
                  : ""}
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                >
                  {messages.prev}
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-40"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={loading || page >= totalPages}
                >
                  {messages.next}
                </button>
              </div>
            </div>
          </>
        )}

        <EditReviewModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          review={editingReview}
          texts={modalTexts}
          onUpdated={handleReviewUpdated}
        />
      </div>
    </main>
  );
}
