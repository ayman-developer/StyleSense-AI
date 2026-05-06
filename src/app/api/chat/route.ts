import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json();

    let systemContext = `You are StyleSense AI, an expert personal fashion stylist assistant. 
You help users with outfit advice, styling tips, wardrobe management, and fashion questions.
Be friendly, concise, and stylish. Give specific, actionable advice.`;

    if (userId) {
      const { data: wardrobe } = await supabaseAdmin
        .from("wardrobe_items")
        .select("category, color, season, occasion_tags")
        .eq("user_id", userId)
        .limit(20);

      if (wardrobe && wardrobe.length > 0) {
        systemContext += `\n\nUser's wardrobe: ${wardrobe.map(w => `${w.color || ""} ${w.category}`).join(", ")}.`;
      }

      const { data: prefs } = await supabaseAdmin
        .from("user_preferences")
        .select("style_personality, favorite_colors, fit_preference, budget_preference")
        .eq("user_id", userId)
        .single();

      if (prefs) {
        systemContext += `\nStyle: ${prefs.style_personality || "not set"}. Colors: ${prefs.favorite_colors?.join(", ") || "any"}. Fit: ${prefs.fit_preference || "any"}. Budget: ${prefs.budget_preference || "any"}.`;
      }
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemContext }, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I couldn't process that request. Please try again!";

    if (userId) {
      const lastUserMsg = messages[messages.length - 1]?.content;
      await supabaseAdmin.from("chat_history").insert([
        { user_id: userId, role: "user", message: lastUserMsg },
        { user_id: userId, role: "assistant", message: reply }
      ]);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
