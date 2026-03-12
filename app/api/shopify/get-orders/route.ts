// app/api/shopify/get-orders/route.ts
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  // Читаем СВЕЖИЕ данные напрямую с сервера — без клиентского кэша
  const user = await client.users.getUser(userId);
  const orders = user.publicMetadata?.orders || [];

  return NextResponse.json({ orders });
}
