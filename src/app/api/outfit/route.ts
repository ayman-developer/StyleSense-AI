import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { weather, occasion } = await request.json();

    if (!weather || !occasion) {
      return NextResponse.json({ error: "weather and occasion are required" }, { status: 400 });
    }

    const prompt = `You are a professional fashion stylist AI.

Current weather in ${weather.city || "the user's city"}:
- Temperature: ${weather.temp}°C (feels like ${weather.feels_like || weather.temp}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.wind} km/h

Occasion: ${occasion}

Suggest a complete, specific, stylish outfit suitable for this weather and occasion.
Be specific about clothing items (include fabric, style, color, and fit details).
Return ONLY a valid JSON object with NO extra text, NO markdown fences:

{
  "top": "specific top description",
  "bottom": "specific bottom description",
  "footwear": "specific footwear description",
  "accessory": "specific accessory description",
  "outerwear": "specific outerwear or null if not needed",
  "colors": "color palette recommendation",
  "tip": "one key styling tip",
  "avoid": "one thing to avoid wearing in this weather"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "{}";
    const outfit = JSON.parse(content);

    return NextResponse.json(outfit);
  } catch (error: any) {
    console.error("Outfit generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate outfit" }, { status: 500 });
  }
}
