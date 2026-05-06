import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { postId, userId } = await request.json();
    if (!postId || !userId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from("ootd_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      // Unlike
      await supabaseAdmin.from("ootd_likes").delete().eq("post_id", postId).eq("user_id", userId);
      await supabaseAdmin.rpc("decrement_likes", { post_id: postId });
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabaseAdmin.from("ootd_likes").insert([{ post_id: postId, user_id: userId }]);
      await supabaseAdmin.from("ootd_posts").update({ likes_count: supabaseAdmin.rpc as any }).eq("id", postId);
      // Simpler: manually increment
      const { data: post } = await supabaseAdmin.from("ootd_posts").select("likes_count").eq("id", postId).single();
      await supabaseAdmin.from("ootd_posts").update({ likes_count: (post?.likes_count || 0) + 1 }).eq("id", postId);
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const userId = searchParams.get("userId");
    if (!postId || !userId) return NextResponse.json({ liked: false });

    const { data } = await supabaseAdmin
      .from("ootd_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();

    return NextResponse.json({ liked: !!data });
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}
