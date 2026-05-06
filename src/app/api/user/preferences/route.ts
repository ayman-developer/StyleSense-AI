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
    const body = await request.json();
    const { userId, stylePersonality, favoriteColors, fitPreference, budgetPreference, gender } = body;

    // Build update object dynamically to only update provided fields
    const updateObj: any = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (stylePersonality !== undefined) updateObj.style_personality = stylePersonality;
    if (favoriteColors !== undefined) updateObj.favorite_colors = favoriteColors;
    if (fitPreference !== undefined) updateObj.fit_preference = fitPreference;
    if (budgetPreference !== undefined) updateObj.budget_preference = budgetPreference;
    if (gender !== undefined) updateObj.gender = gender;

    const { error } = await supabaseAdmin
      .from("user_preferences")
      .upsert(updateObj, { onConflict: "user_id" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
