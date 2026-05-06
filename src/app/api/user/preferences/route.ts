import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { userId, stylePersonality, favoriteColors, fitPreference, budgetPreference } = await request.json();

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        style_personality: stylePersonality,
        favorite_colors: favoriteColors,
        fit_preference: fitPreference,
        budget_preference: budgetPreference,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
