import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? null);
  } catch (error) {
    return NextResponse.json(null, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, stylePersonality, favoriteColors, fitPreference, budgetPreference } = await request.json();
    const { error } = await supabaseAdmin
      .from("user_preferences")
      .upsert({
        user_id: userId, style_personality: stylePersonality,
        favorite_colors: favoriteColors, fit_preference: fitPreference,
        budget_preference: budgetPreference, updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
