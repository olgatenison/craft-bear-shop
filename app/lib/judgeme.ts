// app/lib/judgeme.ts (BACKUP - НЕ ИСПОЛЬЗУЕТСЯ)
import "server-only";
import type { ReviewsData } from "@/app/components/CustomerReviews";

type JudgeMeReview = {
  id: number;
  rating: number;
  body?: string;
  body_html?: string;
  reviewer?: { name?: string };
};

type JudgeMeReviewsResponse = {
  reviews: JudgeMeReview[];
};

type JudgeMeProductResponse = {
  product?: {
    id: number; // внутренний Judge.me product_id
    external_id?: number | string; // Shopify ID
  };
};

const EMPTY_REVIEWS: ReviewsData = {
  average: 0,
  totalCount: 0,
  counts: [
    { rating: 5, count: 0 },
    { rating: 4, count: 0 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ],
  featured: [],
};

export async function getJudgeMeReviews(
  shopifyProductId: string
): Promise<ReviewsData> {
  const shopDomain = process.env.JUDGEME_SHOP_DOMAIN;
  const apiToken = process.env.JUDGEME_PRIVATE_API_TOKEN;

  if (!shopDomain || !apiToken) {
    console.error("Judge.me env missing", {
      shopDomain,
      hasToken: !!apiToken,
    });
    return EMPTY_REVIEWS;
  }

  // 1) Получаем внутренний product_id Judge.me по Shopify ID (external_id)
  const productUrl = new URL("https://judge.me/api/v1/products/-1");
  productUrl.searchParams.set("shop_domain", shopDomain);
  productUrl.searchParams.set("api_token", apiToken);
  productUrl.searchParams.set("external_id", shopifyProductId);

  console.log(
    "Fetching Judge.me product:",
    productUrl.toString().replace(apiToken, "***")
  );

  const productRes = await fetch(productUrl.toString(), { cache: "no-store" });

  if (!productRes.ok) {
    console.error(
      "Failed to fetch Judge.me product",
      await productRes.text(),
      "URL:",
      productUrl.toString().replace(apiToken, "***")
    );
    return EMPTY_REVIEWS;
  }

  const productData: JudgeMeProductResponse = await productRes.json();
  const judgeMeProductId = productData.product?.id;

  if (!judgeMeProductId) {
    console.warn(
      "No Judge.me product found for Shopify product",
      shopifyProductId
    );
    return EMPTY_REVIEWS;
  }

  // 2) Теперь по внутреннему product_id Judge.me забираем отзывы
  const reviewsUrl = new URL("https://judge.me/api/v1/reviews");
  reviewsUrl.searchParams.set("shop_domain", shopDomain);
  reviewsUrl.searchParams.set("api_token", apiToken);
  reviewsUrl.searchParams.set("product_id", String(judgeMeProductId));
  reviewsUrl.searchParams.set("per_page", "100");

  console.log(
    "Fetching Judge.me reviews:",
    reviewsUrl.toString().replace(apiToken, "***")
  );

  const res = await fetch(reviewsUrl.toString(), { cache: "no-store" });

  if (!res.ok) {
    console.error(
      "Failed to fetch Judge.me reviews",
      await res.text(),
      "URL:",
      reviewsUrl.toString().replace(apiToken, "***")
    );
    return EMPTY_REVIEWS;
  }

  const data: JudgeMeReviewsResponse = await res.json();
  const list = data.reviews ?? [];
  const totalCount = list.length;

  const sumRating = list.reduce((acc, r) => acc + (r.rating ?? 0), 0);
  const average = totalCount ? sumRating / totalCount : 0;

  const counts = [5, 4, 3, 2, 1].map((rating) => ({
    rating: rating as 1 | 2 | 3 | 4 | 5,
    count: list.filter((r) => r.rating === rating).length,
  }));

  const featured = list.slice(0, 10).map((r) => ({
    id: r.id,
    rating: r.rating,
    author: r.reviewer?.name || "Anonymous",
    content: r.body_html || r.body || "",
  }));

  console.log(
    `Found ${totalCount} Judge.me reviews, average: ${average.toFixed(1)}`
  );

  return {
    average: Math.round(average * 10) / 10,
    totalCount,
    counts,
    featured,
  };
}
