import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const city = searchParams.get("city");
  const forecast = searchParams.get("forecast") === "true";

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  try {
    let url = "";
    if (city) {
      url = `https://api.openweathermap.org/data/2.5/${forecast ? 'forecast' : 'weather'}?q=${city}&units=metric&appid=${apiKey}`;
    } else if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/${forecast ? 'forecast' : 'weather'}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    } else {
      return NextResponse.json({ error: "Missing lat/lon or city" }, { status: 400 });
    }

    const res = await fetch(url);
    const data = await res.json();

    if (data.cod != 200 && data.cod != "200") {
      return NextResponse.json({ error: data.message || "Weather API error" }, { status: 400 });
    }

    if (forecast) {
      // Return 5-day forecast (picking 12:00 PM entry for each day)
      const dailyForecast = data.list.filter((item: any) => item.dt_txt.includes("12:00:00"));
      return NextResponse.json(dailyForecast.map((item: any) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
        date: new Date(item.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short' })
      })));
    }

    // Return detailed current weather
    return NextResponse.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind: Math.round((data.wind?.speed || 0) * 3.6), // m/s → km/h
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      icon: data.weather[0].icon,
      icon_url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
