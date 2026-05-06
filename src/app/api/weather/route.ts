import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const city = searchParams.get('city')
  const forecast = searchParams.get('forecast') === 'true'
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key missing' }, { status: 500 })
  }

  try {
    let url = ''
    const base = `https://api.openweathermap.org/data/2.5/${forecast ? 'forecast' : 'weather'}`
    
    if (lat && lon) {
      url = `${base}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    } else if (city) {
      url = `${base}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    } else {
      return NextResponse.json({ error: 'Provide lat/lon or city name' }, { status: 400 })
    }

    const res = await fetch(url)
    const data = await res.json()

    if (data.cod != 200 && data.cod != "200") {
      return NextResponse.json({ error: `City not found: ${data.message}` }, { status: 404 })
    }

    if (forecast) {
      // 5-day forecast processing (noon entries)
      const dailyForecast = data.list.filter((item: any) => item.dt_txt.includes("12:00:00"));
      return NextResponse.json(dailyForecast.map((item: any) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: item.weather[0].icon,
        date: new Date(item.dt * 1000).toLocaleDateString('en-IN', { weekday: 'short' })
      })));
    }

    // Current weather data
    const iconCode = data.weather[0].icon
    return NextResponse.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), // m/s to km/h
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      icon: iconCode,
      icon_url: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
    })
  } catch (err: any) {
    console.error("Weather API Error:", err);
    return NextResponse.json({ error: 'Weather fetch failed: ' + err.message }, { status: 500 })
  }
}
