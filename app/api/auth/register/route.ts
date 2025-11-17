// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { shopifyFetch } from "@/app/lib/shopify/client";
import { CUSTOMER_CREATE_MUTATION } from "@/app/lib/shopify/queries/customer.gql";

type CustomerCreateResponse = {
  customerCreate: {
    customer: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
    customerUserErrors: {
      field?: string[] | null;
      message: string;
      code?: string | null;
    }[];
  };
};

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = await req.json();

  // простая валидация на всякий случай
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const data = await shopifyFetch<CustomerCreateResponse>(
      CUSTOMER_CREATE_MUTATION,
      {
        input: {
          email,
          password, // ← пароль отправляется сюда
          firstName,
          lastName,
          acceptsMarketing: true,
        },
      },
      0
    );

    const { customer, customerUserErrors } = data.customerCreate;

    // типичные кейсы — email уже занят, пароль не проходит правила и т.д.
    if (customerUserErrors?.length || !customer) {
      return NextResponse.json({ errors: customerUserErrors }, { status: 400 });
    }

    // тут можно сразу авто-логинить (создать accessToken), но пока просто возвращаем клиента
    return NextResponse.json({ customer });
  } catch (error: unknown) {
    let message = "Something went wrong";

    // shopifyFetch кидает Error(JSON.stringify(json.errors))
    if (error instanceof Error) {
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          message = parsed[0].message;
        } else {
          message = error.message || message;
        }
      } catch {
        message = error.message || message;
      }
    }

    console.error("Register error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
