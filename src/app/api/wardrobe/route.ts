import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const item = await request.json();
    const { 
      user_id, image_url, cloudinary_public_id, category, color, 
      season, occasion_tags, name, fabric, fit, warmth_level 
    } = item;

    if (!user_id || !image_url || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("wardrobe_items")
      .insert([{ 
        user_id, image_url, cloudinary_public_id, category, color, 
        season, occasion_tags, name, fabric, fit, warmth_level 
      }])
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin.from("wardrobe_items").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
