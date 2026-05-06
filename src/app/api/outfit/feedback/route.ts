import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId, weatherSnapshot, occasion, suggestedOutfit, feedback } = await request.json();
    const { data, error } = await supabaseAdmin
      .from("outfit_suggestions")
      .insert([{ user_id: userId, weather_snapshot: weatherSnapshot, occasion, suggested_outfit: suggestedOutfit, feedback }])
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
