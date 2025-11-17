// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "../../../lib/shopify/client";
import { CUSTOMER_BY_TOKEN_QUERY } from "../../../lib/shopify/queries/customer.gql";

const COOKIE_NAME = "shopify_customer_token";

type CustomerResponse = {
  customer: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    defaultAddress: {
      address1: string | null;
      city: string | null;
      country: string | null;
      zip: string | null;
    } | null;
  } | null;
};

export async function GET(req: NextRequest) {
  // ✅ берём куку прямо из req, без cookies()
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ customer: null }, { status: 401 });
  }

  try {
    const data = await shopifyFetch<CustomerResponse>(
      CUSTOMER_BY_TOKEN_QUERY,
      { customerAccessToken: token },
      0
    );

    if (!data.customer) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    return NextResponse.json({ customer: data.customer });
  } catch (error: unknown) {
    console.error("Customer by token error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
