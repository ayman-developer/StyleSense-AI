import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const { weather, occasion, gender = 'male' } = await request.json();

    if (!weather || !occasion) {
      return NextResponse.json({ error: "weather and occasion are required" }, { status: 400 });
    }

    const prompt = `
You are a professional ${gender === 'female' ? "women's" : "men's"} fashion stylist AI in India.

LOCATION: ${weather.city}, ${weather.country}
CURRENT WEATHER:
- Temperature: ${weather.temp}°C (feels like ${weather.feels_like}°C)
- Condition: ${weather.condition}
- Humidity: ${weather.humidity}%
- Wind: ${weather.wind} km/h

OCCASION: ${occasion}
GENDER: ${gender}

Suggest a complete, stylish ${gender} outfit perfect for this weather and occasion in India.
Consider Indian fashion, Indian climate, and Indian occasions.
Be specific about clothing items, fabrics, colors, and fit.

Return ONLY valid JSON, no markdown, no explanation:

${gender === 'female' ? `
{
  "outfit": "full outfit description (saree/kurta/dress/top+bottom etc.)",
  "footwear": "specific footwear (heels/flats/sandals/juttis)",
  "bag": "bag type and color (clutch/tote/handbag)",
  "jewellery": "jewellery suggestions (earrings/necklace/bangles)",
  "dupatta_scarf": "if applicable or null",
  "makeup": "makeup tone suggestion (light/medium/bold)",
  "colors": "color palette",
  "tip": "one key styling tip",
  "avoid": "what to avoid in this weather",
  "fabric_recommendation": "best fabric for this weather"
}
` : `
{
  "top": "specific top (shirt/tee/kurta/polo)",
  "bottom": "specific bottom (trouser/jeans/chino/dhoti)",
  "footwear": "specific footwear (sneakers/loafers/formals/chappals)",
  "accessory": "watch/belt/cap/wallet",
  "outerwear": "jacket/blazer/hoodie or null",
  "colors": "color palette",
  "tip": "one key styling tip",
  "avoid": "what to avoid in this weather",
  "fabric_recommendation": "best fabric for this weather"
}
`}
`;

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
