// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/app/lib/shopify/client";

const CUSTOMER_RESET_BY_URL_MUTATION = `
  mutation customerResetByUrl($resetUrl: URL!, $password: String!) {
    customerResetByUrl(resetUrl: $resetUrl, password: $password) {
      customer {
        id
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

type ResetResponse = {
  customerResetByUrl: {
    customer?: {
      id: string;
    };
    customerAccessToken?: {
      accessToken: string;
      expiresAt: string;
    };
    customerUserErrors: {
      field?: string[] | null;
      message: string;
      code?: string | null;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const { resetUrl, password } = await req.json();

  if (!resetUrl || !password) {
    return NextResponse.json(
      { error: "Reset URL and password are required" },
      { status: 400 }
    );
  }

  // Валидация пароля
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  try {
    const data = await shopifyFetch<ResetResponse>(
      CUSTOMER_RESET_BY_URL_MUTATION,
      { resetUrl, password },
      0
    );

    const { customerUserErrors, customerAccessToken } = data.customerResetByUrl;

    if (customerUserErrors?.length) {
      return NextResponse.json({ errors: customerUserErrors }, { status: 400 });
    }

    // Устанавливаем токен в куки если нужно автоматически залогинить
    const response = NextResponse.json({
      ok: true,
      message: "Password reset successfully",
    });

    if (customerAccessToken) {
      response.cookies.set(
        "customerAccessToken",
        customerAccessToken.accessToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30, // 30 дней
        }
      );
    }

    return response;
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
