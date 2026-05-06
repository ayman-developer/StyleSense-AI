import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });

export async function POST(request: Request) {
  try {
    const { weather, occasion, preferences, pastLikedOutfits, wardrobe } = await request.json();

    const prompt = `
You are an expert AI fashion stylist.
The user is attending a "${occasion}".
The current weather is ${weather?.main || "Clear"} with a temperature of ${weather?.temp || 22}°C.
Their style preferences are: ${preferences || 'Not specified'}.
Provide a stylish outfit combination, reasoning, and styling tips.
Return the response in a structured JSON format EXACTLY like this:
{
  "suggestion": "string",
  "reasoning": "string",
  "tips": "string"
}
Do not output any markdown code blocks, just raw JSON.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate outfit" }, { status: 500 });
  }
}
