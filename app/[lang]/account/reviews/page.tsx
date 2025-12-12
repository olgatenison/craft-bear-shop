// app/[lang]/account/reviews/page.tsx
// SERVER component

import { getMessages } from "../../messages";
import type { Locale } from "../../../lib/locale";
import AccountReviewContent from "@/app/components/AccountReviewContent";

export default async function Page({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const messages = await getMessages(lang);

  const accountMessages = messages.AccountPage;
  const reviewMessages = messages.AccountReview;
  const reviewModalTexts = messages.LeaveReviewModal;

  return (
    <AccountReviewContent
      accountMessages={accountMessages}
      reviewMessages={reviewMessages}
      reviewModalTexts={reviewModalTexts}
    />
  );
}
