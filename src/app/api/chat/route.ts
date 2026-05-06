import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "@/lib/supabase";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });

export async function POST(request: Request) {
  try {
    const { messages, userId } = await request.json();

    // In a real app, fetch user wardrobe and preferences from Supabase to provide context
    let systemContext = `You are an expert AI fashion stylist named StyleSense AI. 
Provide concise, helpful, and stylish advice.`;

    if (userId) {
      // Optional: Fetch wardrobe
      const { data: wardrobe } = await supabase.from("wardrobe_items").select("category, color").eq("user_id", userId).limit(20);
      if (wardrobe && wardrobe.length > 0) {
        systemContext += `\nThe user has these items in their wardrobe: ${wardrobe.map(w => `${w.color} ${w.category}`).join(", ")}.`;
      }
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemContext },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

    // Save to chat_history
    if (userId) {
      const lastUserMessage = messages[messages.length - 1]?.content;
      await supabase.from("chat_history").insert([
        { user_id: userId, role: "user", message: lastUserMessage },
        { user_id: userId, role: "assistant", message: reply }
      ]);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}
