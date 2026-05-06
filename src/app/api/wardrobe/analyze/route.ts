import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { userId, weather, location } = await request.json();

    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    // Fetch all wardrobe items
    const { data: wardrobe, error } = await supabaseAdmin
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    if (!wardrobe || wardrobe.length === 0) {
      return NextResponse.json(
        { error: "No wardrobe items found. Please upload your clothes first." },
        { status: 400 }
      );
    }

    // Build concise wardrobe summary
    const wardrobeSummary = wardrobe.map((item) => ({
      name: item.name || item.category,
      category: item.category,
      color: item.color,
      fabric: item.fabric,
      warmth: item.warmth_level,
      seasons: item.season,
      occasions: item.occasion_tags,
      times_worn: item.times_worn,
    }));

    const tempFeel =
      weather?.temp > 30
        ? "Hot Summer"
        : weather?.temp > 20
        ? "Warm"
        : weather?.temp > 10
        ? "Cool"
        : "Cold";

    const prompt = `You are an expert fashion stylist and wardrobe consultant AI.

The user lives in ${location || "a tropical region"}.

CURRENT WEATHER:
- Temperature: ${weather?.temp || 28}°C (feels ${tempFeel})
- Condition: ${weather?.condition || "sunny"}
- Humidity: ${weather?.humidity || 70}%

USER'S WARDROBE (${wardrobe.length} items):
${JSON.stringify(wardrobeSummary, null, 2)}

Analyze this wardrobe completely. Return ONLY a valid JSON object — no markdown, no extra text:

{
  "summary": {
    "total_items": ${wardrobe.length},
    "well_covered_seasons": ["seasons user is well prepared for"],
    "weak_seasons": ["seasons user lacks clothes for"],
    "well_covered_occasions": ["occasions with enough clothes"],
    "weak_occasions": ["occasions lacking clothes"],
    "most_worn_category": "category name",
    "wardrobe_score": 0-100,
    "score_reason": "one sentence explanation"
  },
  "weather_readiness": {
    "current_weather_ready": true,
    "current_weather_message": "message about today's weather readiness",
    "outfits_possible_today": 3,
    "best_outfit_for_today": {
      "top": "item name from wardrobe",
      "bottom": "item name from wardrobe",
      "footwear": "item name or suggestion",
      "reason": "why this works for today"
    }
  },
  "missing_items": [
    {
      "item": "specific clothing item",
      "category": "category",
      "reason": "why needed based on wardrobe gaps",
      "weather_type": "weather this covers",
      "occasions": ["applicable occasions"],
      "priority": "High",
      "estimated_budget": "₹500-1000",
      "color_suggestion": "recommended color",
      "fabric_suggestion": "recommended fabric"
    }
  ],
  "outfit_combinations": [
    {
      "name": "Outfit name",
      "occasion": "occasion",
      "weather": "suitable weather",
      "items": {
        "top": "item from wardrobe",
        "bottom": "item from wardrobe",
        "footwear": "item or suggestion",
        "accessory": "optional"
      },
      "tip": "styling tip"
    }
  ],
  "shopping_list": {
    "urgent": ["item 1", "item 2"],
    "soon": ["item 3"],
    "optional": ["item 4"]
  },
  "style_insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(content);

    // Save analysis result
    await supabaseAdmin.from("wardrobe_analysis").upsert(
      { user_id: userId, analysis, weather_snapshot: weather, analyzed_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("Wardrobe analyze error:", err);
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
