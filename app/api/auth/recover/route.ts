// app/api/auth/recover/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/app/lib/shopify/client";
import { CUSTOMER_RECOVER_MUTATION } from "@/app/lib/shopify/queries/customer.gql";

type RecoverResponse = {
  customerRecover: {
    customerUserErrors: {
      field?: string[] | null;
      message: string;
      code?: string | null;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const data = await shopifyFetch<RecoverResponse>(
      CUSTOMER_RECOVER_MUTATION,
      { email },
      0
    );

    const { customerUserErrors } = data.customerRecover;

    if (customerUserErrors?.length) {
      return NextResponse.json({ errors: customerUserErrors }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "Password reset email sent if this email exists.",
    });
  } catch (error: unknown) {
    console.error("Recover error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
