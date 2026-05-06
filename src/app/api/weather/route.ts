import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    // Return normalized fallback data if no API key
    return NextResponse.json({
      city: "Your City",
      temp: 24,
      feels_like: 26,
      condition: "clear sky",
      humidity: 50,
      wind: 12,
      icon: "01d",
    });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      return NextResponse.json({ error: data.message || "Weather API error" }, { status: 400 });
    }

    // Return normalized format consumed by dashboard + outfit AI
    return NextResponse.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather?.[0]?.description || "clear",
      humidity: data.main.humidity,
      wind: Math.round((data.wind?.speed || 0) * 3.6), // m/s → km/h
      icon: data.weather?.[0]?.icon || "01d",
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
