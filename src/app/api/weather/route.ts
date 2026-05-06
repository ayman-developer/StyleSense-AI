import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const city = searchParams.get('city')

  // Debug logs for environment verification
  console.log('API KEY EXISTS:', !!process.env.OPENWEATHERMAP_API_KEY)
  
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'OPENWEATHERMAP_API_KEY is not set in environment variables' 
    }, { status: 500 })
  }

  try {
    let url = ''
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${apiKey}&units=metric`
    } else {
      return NextResponse.json({ error: 'Provide lat/lon or city name' }, { status: 400 })
    }

    const res = await fetch(url)
    const data = await res.json()

    console.log('OpenWeatherMap response cod:', data.cod)

    if (String(data.cod) !== '200') {
      return NextResponse.json({ 
        error: `Weather API error: ${data.message}` 
      }, { status: 400 })
    }

    const iconCode = data.weather[0].icon

    return NextResponse.json({
      city: data.name,
      country: data.sys.country,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      condition: data.weather[0].description,
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { 
        hour: '2-digit', minute: '2-digit' 
      }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { 
        hour: '2-digit', minute: '2-digit' 
      }),
      icon_url: `https://openweathermap.org/img/wn/${iconCode}@2x.png`,
    })
  } catch (err: any) {
    console.error('Weather fetch error:', err)
    return NextResponse.json({ error: 'Weather fetch failed: ' + err.message }, { status: 500 })
  }
}
