"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Cloud, CloudRain, Sun, Wind, Droplets, MapPin,
  Loader2, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, 
  Thermometer, Zap, ArrowRight, ShoppingBag, TrendingUp, 
  CheckCircle2, Sunrise, Sunset, Search, RefreshCcw, Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Weather = {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  condition: string;
  humidity: number;
  wind: number;
  sunrise: string;
  sunset: string;
  icon: string;
  icon_url: string;
};

type Forecast = {
  dt: number;
  temp: number;
  condition: string;
  icon: string;
  date: string;
};

const MALE_OCCASIONS = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival", "Traditional (Kurta/Dhoti)"];
const FEMALE_OCCASIONS = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival", "Traditional (Saree/Salwar)", "Wedding Guest", "Brunch"];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Dashboard State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  
  const [occasion, setOccasion] = useState("Casual");
  const [outfit, setOutfit] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  // Wardrobe Intelligence State
  const [analysis, setAnalysis] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

  // Initial Data Fetch
  useEffect(() => {
    if (user?.uid) {
      fetchPreferences();
      fetchAnalysis();
      fetchWardrobe();
      autoDetectLocation();
    }
  }, [user?.uid]);

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`/api/user/preferences?userId=${user?.uid}`);
      const data = await res.json();
      if (data?.gender) setGender(data.gender);
    } catch (e) {}
  };

  const updateGender = async (newGender: 'male' | 'female') => {
    setGender(newGender);
    setOccasion("Casual");
    setOutfit(null);
    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, gender: newGender })
      });
    } catch (e) {}
  };

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/wardrobe/analyze/last?userId=${user?.uid}`);
      if (res.ok) setAnalysis(await res.json());
    } catch (e) {}
  };

  const fetchWardrobe = async () => {
    try {
      const res = await fetch(`/api/wardrobe?userId=${user?.uid}`);
      setWardrobeItems(await res.json());
    } catch (e) {}
  };

  const fetchWeatherData = async (lat?: number, lon?: number, city?: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const query = city ? `city=${city}` : `lat=${lat}&lon=${lon}`;
      
      // Current Weather
      const weatherRes = await fetch(`/api/weather?${query}`);
      const weatherData = await weatherRes.json();
      if (!weatherRes.ok) throw new Error(weatherData.error || "Weather fetch failed");
      setWeather(weatherData);

      // Forecast
      const forecastRes = await fetch(`/api/weather?${query}&forecast=true`);
      if (forecastRes.ok) setForecast(await forecastRes.json());
      
      setShowCitySearch(false);
    } catch (err: any) {
      setWeatherError(err.message || "Could not fetch weather.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const autoDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude),
        () => {
          setWeatherError("Location access denied");
          setShowCitySearch(true);
        }
      );
    } else {
      setShowCitySearch(true);
    }
  };

  const handleGenerateOutfit = async () => {
    if (!weather) {
      setOutfitError("Please get your location weather first!");
      return;
    }
    setGenerating(true);
    setOutfit(null);
    setOutfitError(null);
    setFeedbackSent(false);
    try {
      const res = await fetch("/api/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, occasion, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate outfit");
      setOutfit(data);
    } catch (err: any) {
      setOutfitError(err.message || "Something went wrong. Try again.");
      console.error("Generate outfit error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleFeedback = async (feedback: "like" | "dislike") => {
    if (!outfit || !user?.uid) return;
    try {
      await fetch("/api/outfit/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          weatherSnapshot: weather,
          occasion,
          suggestedOutfit: outfit,
          feedback,
        }),
      });
      setFeedbackSent(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getWeatherTip = (temp: number, condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return "🌧️ Rainy — Wear waterproof shoes, carry umbrella";
    if (c.includes('storm')) return "⛈️ Stormy — Stay indoors if possible";
    if (temp >= 35) return "🔥 Very Hot — Wear light cotton/linen. Stay hydrated!";
    if (temp >= 30) return "☀️ Hot & Sunny — Light breathable fabrics recommended";
    if (temp >= 25) return "🌤️ Warm — Light layers work well today";
    if (temp >= 20) return "⛅ Pleasant — Perfect weather for any outfit";
    if (temp >= 15) return "🌥️ Cool — Add a light jacket or cardigan";
    return "🧥 Cold — Layer up with warm clothing";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 md:px-0">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Welcome back, {user?.displayName?.split(" ")[0] || "Stylist"}! {gender === 'male' ? '👨💼' : '👩💼'}
          </h1>
          <p className="text-zinc-500 text-lg font-medium">Personalized fashion intelligence for {user?.displayName?.split(" ")[0] || "Ayman"}.</p>
        </div>
      </header>

      {/* Gender Toggle */}
      <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-2xl w-full sm:w-80 shadow-lg">
        <button 
          onClick={() => updateGender('male')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${gender === 'male' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          👨 Male
        </button>
        <button 
          onClick={() => updateGender('female')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${gender === 'female' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          👩 Female
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generator */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-8 md:p-10 shadow-2xl">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
              <Zap className="w-6 h-6 text-purple-500" />
              Outfit Generator
            </h2>

            <div className="space-y-8">
              <div>
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">THE OCCASION</p>
                <div className="flex flex-wrap gap-2.5">
                  {(gender === 'male' ? MALE_OCCASIONS : FEMALE_OCCASIONS).map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setOccasion(occ)}
                      className={`px-5 py-2.5 rounded-2xl border text-sm font-bold transition-all ${
                        occasion === occ
                          ? "bg-white text-black border-white shadow-xl shadow-white/10"
                          : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {outfitError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5" /> {outfitError}
                </div>
              )}

              <button
                onClick={handleGenerateOutfit}
                disabled={generating || !weather}
                className="w-full py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white shadow-2xl shadow-purple-900/20 active:scale-95"
              >
                {generating ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> STYLING...</>
                ) : (
                  <><Zap className="w-6 h-6" /> GENERATE OUTFIT</>
                )}
              </button>
            </div>

            {/* Result Section */}
            {outfit && (
              <div className="mt-10 p-8 bg-zinc-950 border border-zinc-800 rounded-[32px] animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                  <h3 className="text-2xl font-bold text-white">Suggested Ensemble</h3>
                  <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-[10px] font-black uppercase tracking-widest">{occasion}</div>
                </div>

                {gender === 'male' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {[
                        { l: "Top", v: outfit.top, e: "👕" },
                        { l: "Bottom", v: outfit.bottom, e: "👖" },
                        { l: "Footwear", v: outfit.footwear, e: "👟" },
                        { l: "Accessory", v: outfit.accessory, e: "⌚" },
                        ...(outfit.outerwear ? [{ l: "Outerwear", v: outfit.outerwear, e: "🧥" }] : []),
                      ].map(i => (
                        <div key={i.l} className="flex gap-4 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                          <span className="text-2xl">{i.e}</span>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{i.l}</p>
                            <p className="text-sm font-medium text-zinc-200">{i.v}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-3xl h-fit">
                       <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Styling Advice</p>
                       <p className="text-zinc-200 italic leading-relaxed">&quot;{outfit.tip}&quot;</p>
                       <div className="mt-6 pt-6 border-t border-purple-500/10 space-y-2">
                         <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Avoid: <span className="text-zinc-400 normal-case font-normal">{outfit.avoid}</span></p>
                         <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Fabric: <span className="text-zinc-400 normal-case font-normal">{outfit.fabric_recommendation}</span></p>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {[
                        { l: "Outfit", v: outfit.outfit, e: "👗" },
                        { l: "Footwear", v: outfit.footwear, e: "👡" },
                        { l: "Bag", v: outfit.bag, e: "👜" },
                        { l: "Jewellery", v: outfit.jewellery, e: "💍" },
                        ...(outfit.dupatta_scarf ? [{ l: "Dupatta/Scarf", v: outfit.dupatta_scarf, e: "🧣" }] : []),
                        { l: "Makeup", v: outfit.makeup, e: "💄" },
                      ].map(i => (
                        <div key={i.l} className="flex gap-4 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                          <span className="text-2xl">{i.e}</span>
                          <div>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{i.l}</p>
                            <p className="text-sm font-medium text-zinc-200">{i.v}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-3xl h-fit">
                       <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Styling Advice</p>
                       <p className="text-zinc-200 italic leading-relaxed">&quot;{outfit.tip}&quot;</p>
                       <div className="mt-6 pt-6 border-t border-purple-500/10 space-y-2">
                         <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Avoid: <span className="text-zinc-400 normal-case font-normal">{outfit.avoid}</span></p>
                         <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Fabric: <span className="text-zinc-400 normal-case font-normal">{outfit.fabric_recommendation}</span></p>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weather */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              {weather ? <Image src={weather.icon_url} alt="weather" width={200} height={200} /> : <Sun className="w-40 h-40" />}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-zinc-400 font-bold">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  {weather ? `${weather.city}, ${weather.country}` : "Detecting location..."}
                </div>
                <button onClick={autoDetectLocation} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors">
                  <RefreshCcw className={`w-4 h-4 ${weatherLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {weatherLoading && !weather ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                  <p className="text-zinc-500 font-medium">📍 Detecting your location...</p>
                </div>
              ) : weather ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-[32px] flex items-center justify-center shadow-inner">
                      <Image src={weather.icon_url} alt="icon" width={80} height={80} />
                    </div>
                    <div>
                      <div className="text-7xl font-black text-white">{weather.temp}°<span className="text-2xl align-top mt-2 inline-block">C</span></div>
                      <p className="text-zinc-400 font-bold capitalize text-xl">{weather.condition}</p>
                      <p className="text-zinc-500 text-sm mt-1">Feels like {weather.feels_like}°C</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-zinc-800 flex items-center gap-4">
                      <Droplets className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Humidity</p>
                        <p className="text-lg font-bold">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-zinc-800 flex items-center gap-4">
                      <Wind className="w-6 h-6 text-teal-400" />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Wind</p>
                        <p className="text-lg font-bold">{weather.wind}km/h</p>
                      </div>
                    </div>
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-zinc-800 flex items-center gap-4">
                      <Sunrise className="w-6 h-6 text-amber-400" />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sunrise</p>
                        <p className="text-lg font-bold">{weather.sunrise}</p>
                      </div>
                    </div>
                    <div className="bg-zinc-950/50 p-5 rounded-3xl border border-zinc-800 flex items-center gap-4">
                      <Sunset className="w-6 h-6 text-rose-400" />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sunset</p>
                        <p className="text-lg font-bold">{weather.sunset}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-[28px] border border-white/10 flex items-center gap-4">
                    <Calendar className="w-6 h-6 text-zinc-400" />
                    <div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weather Insight</p>
                      <p className="text-white font-bold leading-relaxed">{getWeatherTip(weather.temp, weather.condition)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 space-y-6">
                  {showCitySearch ? (
                    <div className="space-y-4">
                      <p className="text-zinc-400 text-sm">Location denied. Enter your city manually:</p>
                      <div className="flex gap-2">
                        <input 
                          value={searchCity}
                          onChange={e => setSearchCity(e.target.value)}
                          placeholder="e.g. Chennai"
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-purple-500/20"
                        />
                        <button 
                          onClick={() => fetchWeatherData(undefined, undefined, searchCity)}
                          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 transition-all"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                  ) : weatherError && (
                    <div className="text-center p-6 border border-dashed border-zinc-800 rounded-3xl">
                      <AlertCircle className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm">{weatherError}</p>
                      <button onClick={() => setShowCitySearch(true)} className="mt-4 text-purple-400 text-xs font-bold">Search Manually</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Forecast Strip */}
          {forecast.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max">
                {forecast.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl w-24">
                    <p className="text-[10px] font-black text-zinc-500 uppercase">{f.date}</p>
                    <Image src={`https://openweathermap.org/img/wn/${f.icon}.png`} alt="icon" width={40} height={40} />
                    <p className="text-xl font-black text-white">{f.temp}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Intelligence Preview */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[40px] p-8 shadow-2xl">
            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Wardrobe Intelligence
            </h3>
            {analysis ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-400 font-black text-lg">
                      {analysis.analysis.summary.wardrobe_score}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-500 uppercase">Style Score</p>
                      <p className="text-sm font-bold">Readiness Score</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <Link href="/wardrobe" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500 transition-all shadow-lg shadow-purple-900/20">
                  Full Analysis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-600 text-sm">Upload your wardrobe to see score</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
