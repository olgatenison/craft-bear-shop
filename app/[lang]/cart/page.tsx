import ShoppingCardOverviews from "@/app/components/ShoppingCardOverviews";
import { getMessages, Locale } from "../messages";

export default async function CartPage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;

  const t = await getMessages(lang);
  const cart = t.ShoppingCardOverviews;

  return (
    <main>
      <ShoppingCardOverviews
        lang={lang}
        shoppingCart={cart.shoppingCart}
        description={cart.description}
        orderSummary={cart.orderSummary}
        subtotal={cart.subtotal}
        shippingEstimate={cart.shippingEstimate}
        taxEstimate={cart.taxEstimate}
        shippingEstimateInfo={cart.shippingEstimateInfo}
        taxEstimateInfo={cart.taxEstimateInfo}
        total={cart.total}
        checkout={cart.checkout}
        empty={cart.empty}
        emptyDescription={cart.emptyDescription}
        CTAAdd={cart.CTAAdd}
        continueShopping={cart.continueShopping}
        shippingPending={cart.shippingPending}
        shippingModalTitle={cart.shippingModalTitle}
        shippingModalDescription={cart.shippingModalDescription}
        shippingModalNotice={cart.shippingModalNotice}
        shippingModalCancel={cart.shippingModalCancel}
        shippingModalConfirm={cart.shippingModalConfirm}
        shippingTotalWithoutDelivery={cart.shippingTotalWithoutDelivery}
        checkoutError={cart.checkoutError}
        shippingCountryLabel={cart.shippingCountryLabel}
        shippingCountryEstonia={cart.shippingCountryEstonia}
        shippingCountryFinland={cart.shippingCountryFinland}
        shippingCountryLatvia={cart.shippingCountryLatvia}
        shippingCountryLithuania={cart.shippingCountryLithuania}
        shippingCountryOther={cart.shippingCountryOther}
        shippingCountryCodeLabel={cart.shippingCountryCodeLabel}
        shippingAddressTitle={cart.shippingAddressTitle}
        shippingFirstName={cart.shippingFirstName}
        shippingLastName={cart.shippingLastName}
        shippingAddress1={cart.shippingAddress1}
        shippingAddress2={cart.shippingAddress2}
        shippingCity={cart.shippingCity}
        shippingPostalCode={cart.shippingPostalCode}
        shippingPhone={cart.shippingPhone}
        shippingDraftSubmit={cart.shippingDraftSubmit}
        shippingDraftSuccess={cart.shippingDraftSuccess}
        shippingDraftError={cart.shippingDraftError}
        shippingActiveDraftTitle={cart.shippingActiveDraftTitle}
        shippingActiveDraftDescription={cart.shippingActiveDraftDescription}
      />
    </main>
  );
}
