import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from("ootd_posts")
      .select("*, users (name, avatar_url)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, imageUrl, occasionTag, weatherTag, caption } = await request.json();

    const { data, error } = await supabase
      .from("ootd_posts")
      .insert([{
        user_id: userId,
        image_url: imageUrl,
        occasion_tag: occasionTag,
        weather_tag: weatherTag,
        caption
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
