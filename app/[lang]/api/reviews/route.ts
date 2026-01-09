// app\[lang]\api\reviews\route.ts
import { NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { getSupabaseServerClient } from "@/app/lib/supabase";

type RouteContext = {
  params: Promise<{ lang: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  try {
    const { lang } = await context.params;
    console.log("✅ Lang:", lang);

    const { userId } = await clerkAuth();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be logged in to leave a review" },
        { status: 401 }
      );
    }

    const { shopify_product_id, rating, comment, user_name, user_email } =
      await req.json();

    if (
      !shopify_product_id ||
      !rating ||
      !comment ||
      !user_name ||
      !user_email
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient();

    const { data: existing, error: existingError } = await supabase
      .from("reviews")
      .select("id")
      .eq("shopify_product_id", shopify_product_id)
      .eq("clerk_user_id", userId)
      .limit(1);

    if (existingError) {
      console.error("Supabase error (check existing):", existingError);
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        shopify_product_id,
        clerk_user_id: userId,
        user_name,
        user_email,
        rating: Number(rating),
        comment: comment.trim(),
        status: "approved",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create review" },
        { status: 500 }
      );
    }

    console.log("✅ Review created:", data.id);

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    console.error("❌ Review creation error:", err);

    const message = err instanceof Error ? err.message : "Unexpected error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// // app\[lang]\api\reviews\route.ts
// import { NextResponse } from "next/server";
// import { auth as clerkAuth } from "@clerk/nextjs/server";
// import { getSupabaseServerClient } from "@/app/lib/supabase";

// export async function POST(req: Request) {
//   try {
//     // 👇 используем тип и с await
//     const { userId } = await clerkAuth();

//     if (!userId) {
//       return NextResponse.json(
//         { error: "You must be logged in to leave a review" },
//         { status: 401 }
//       );
//     }

//     const { shopify_product_id, rating, comment, user_name, user_email } =
//       await req.json();

//     if (
//       !shopify_product_id ||
//       !rating ||
//       !comment ||
//       !user_name ||
//       !user_email
//     ) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (rating < 1 || rating > 5) {
//       return NextResponse.json(
//         { error: "Rating must be between 1 and 5" },
//         { status: 400 }
//       );
//     }

//     if (comment.length < 10) {
//       return NextResponse.json(
//         { error: "Comment must be at least 10 characters long" },
//         { status: 400 }
//       );
//     }

//     const supabase = getSupabaseServerClient();

//     const { data: existing, error: existingError } = await supabase
//       .from("reviews")
//       .select("id")
//       .eq("shopify_product_id", shopify_product_id)
//       .eq("clerk_user_id", userId)
//       .limit(1);

//     if (existingError) {
//       console.error("Supabase error (check existing):", existingError);
//     }

//     if (existing && existing.length > 0) {
//       return NextResponse.json(
//         { error: "You have already reviewed this product" },
//         { status: 400 }
//       );
//     }

//     const { data, error } = await supabase
//       .from("reviews")
//       .insert({
//         shopify_product_id,
//         clerk_user_id: userId,
//         user_name,
//         user_email,
//         rating: Number(rating),
//         comment: comment.trim(),
//         status: "approved",
//       })
//       .select()
//       .single();

//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json(
//         { error: "Failed to create review" },
//         { status: 500 }
//       );
//     }

//     console.log("✅ Review created:", data.id);

//     return NextResponse.json({ success: true, review: data });
//   } catch (err: unknown) {
//     console.error("❌ Review creation error:", err);

//     const message = err instanceof Error ? err.message : "Unexpected error";

//     return NextResponse.json({ error: message }, { status: 500 });
//   }
// }
