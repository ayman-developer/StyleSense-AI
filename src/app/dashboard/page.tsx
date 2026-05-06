"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  MapPin, Loader2, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, 
  Droplets, Wind, Sunrise, Sunset, Search, RefreshCcw, Calendar,
  ArrowRight, Zap, CheckCircle2
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
  
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [cityInput, setCityInput] = useState("");
  
  const [occasion, setOccasion] = useState("Casual");
  const [outfit, setOutfit] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (user?.uid) {
      fetchPreferences();
      fetchAnalysis();
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

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/wardrobe/analyze/last?userId=${user?.uid}`);
      if (res.ok) setAnalysis(await res.json());
    } catch (e) {}
  };

  const fetchWeatherData = async (lat?: number, lon?: number, city?: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const query = city ? `city=${encodeURIComponent(city.trim())}` : `lat=${lat}&lon=${lon}`;
      
      const weatherRes = await fetch(`/api/weather?${query}`);
      const weatherData = await weatherRes.json();
      if (!weatherRes.ok) throw new Error(weatherData.error || "Weather fetch failed");
      setWeather(weatherData);

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

  const handleCitySearch = () => {
    if (cityInput.trim()) fetchWeatherData(undefined, undefined, cityInput.trim());
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
    } finally {
      setGenerating(false);
    }
  };

  const getWeatherTip = (temp: number, condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain')) return "🌧️ Rainy — Wear waterproof shoes, carry umbrella";
    if (temp >= 35) return "🔥 Very Hot — Wear light cotton/linen. Stay hydrated!";
    if (temp >= 25) return "🌤️ Warm — Light layers work well today";
    if (temp >= 15) return "🌥️ Cool — Add a light jacket or cardigan";
    return "🧥 Cold — Layer up with warm clothing";
  };

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E] mb-1">
          Welcome back, {user?.displayName?.split(" ")[0] || "Stylist"}! {gender === 'male' ? '👨💼' : '👩💼'}
        </h1>
        <p className="text-[#6B7280] text-lg">Personalized fashion intelligence for you.</p>
      </header>

      {/* Gender Toggle */}
      <div className="flex bg-[#F3F4FF] p-1 rounded-2xl w-fit mb-8 border border-[#E2E4F0]">
        <button 
          onClick={() => updateGender('male')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md' : 'text-[#6B7280] hover:text-[#7C3AED]'}`}
        >
          👨 Male
        </button>
        <button 
          onClick={() => updateGender('female')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md' : 'text-[#6B7280] hover:text-[#7C3AED]'}`}
        >
          👩 Female
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
        {/* Left Column: Generator */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-[#7C3AED]" />
              Outfit Generator
            </h2>

            <div className="space-y-6">
              <div>
                <span className="section-label">THE OCCASION</span>
                <div className="flex flex-wrap gap-2">
                  {(gender === 'male' ? MALE_OCCASIONS : FEMALE_OCCASIONS).map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setOccasion(occ)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all ${
                        occasion === occ
                          ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white border-transparent shadow-sm"
                          : "bg-[#F3F4FF] text-[#1A1A2E] border-[#E2E4F0] hover:border-[#7C3AED]"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerateOutfit}
                disabled={generating || !weather}
                className="btn-primary w-full h-[52px] text-lg"
              >
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {generating ? "STYLING..." : "GENERATE OUTFIT"}
              </button>
            </div>

            {/* Result Section */}
            {outfit && (
              <div className="mt-8 p-6 bg-gradient-to-br from-[#FAF5FF] to-[#FDF2F8] border border-[#DDD6FE] rounded-2xl animate-fade-in">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E2E4F0]">
                  <h3 className="text-xl font-bold text-[#1A1A2E]">Suggested Ensemble</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7C3AED] bg-[#F3F4FF] px-3 py-1 rounded-lg">{occasion}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {gender === 'male' ? [
                      { l: "Top", v: outfit.top, e: "👕" },
                      { l: "Bottom", v: outfit.bottom, e: "👖" },
                      { l: "Footwear", v: outfit.footwear, e: "👟" },
                      { l: "Accessory", v: outfit.accessory, e: "⌚" },
                    ].map(i => (
                      <div key={i.l} className="flex gap-4 p-3 bg-white border border-[#E2E4F0] rounded-xl">
                        <span className="text-xl">{i.e}</span>
                        <div>
                          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{i.l}</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">{i.v}</p>
                        </div>
                      </div>
                    )) : [
                      { l: "Outfit", v: outfit.outfit, e: "👗" },
                      { l: "Footwear", v: outfit.footwear, e: "👡" },
                      { l: "Bag", v: outfit.bag, e: "👜" },
                      { l: "Jewellery", v: outfit.jewellery, e: "💍" },
                    ].map(i => (
                      <div key={i.l} className="flex gap-4 p-3 bg-white border border-[#E2E4F0] rounded-xl">
                        <span className="text-xl">{i.e}</span>
                        <div>
                          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{i.l}</p>
                          <p className="text-sm font-semibold text-[#1A1A2E]">{i.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#FFFFFF]/60 p-5 rounded-xl border border-[#E2E4F0]">
                     <p className="text-xs font-bold text-[#7C3AED] uppercase mb-2">Style Tip</p>
                     <p className="text-[#1A1A2E] italic text-sm mb-4">&quot;{outfit.tip}&quot;</p>
                     <div className="pt-4 border-t border-[#E2E4F0] space-y-2">
                       <p className="text-[11px] font-bold text-red-500 uppercase">Avoid: <span className="text-[#6B7280] normal-case font-medium">{outfit.avoid}</span></p>
                       <p className="text-[11px] font-bold text-emerald-600 uppercase">Fabric: <span className="text-[#6B7280] normal-case font-medium">{outfit.fabric_recommendation}</span></p>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Forecast Strip */}
          {forecast.length > 0 && (
            <div className="bg-white border border-[#E2E4F0] rounded-2xl p-6 overflow-x-auto shadow-sm">
              <div className="flex gap-4 min-w-max">
                {forecast.map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-[#F8F9FF] border border-[#E2E4F0] rounded-xl w-24">
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">{f.date}</p>
                    <img src={`https://openweathermap.org/img/wn/${f.icon}.png`} alt="icon" width={32} height={32} />
                    <p className="text-lg font-black text-[#1A1A2E]">{f.temp}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Weather */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#EEF2FF] to-[#FAF5FF] border border-[#DDD6FE] rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-[#7C3AED] font-bold">
                <MapPin className="w-4 h-4" />
                {weather ? `${weather.city}, ${weather.country}` : "Detecting..."}
              </div>
              <button onClick={autoDetectLocation} className="p-2 bg-white hover:bg-[#F3F4FF] rounded-full border border-[#E2E4F0] shadow-sm">
                <RefreshCcw className={`w-4 h-4 text-[#7C3AED] ${weatherLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {weatherLoading && !weather ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                <p className="text-[#6B7280] text-sm">Detecting location...</p>
              </div>
            ) : weather ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <img src={weather.icon_url} alt="weather" width={64} height={64} className="bg-white rounded-2xl shadow-sm" />
                  <div>
                    <div className="text-5xl font-extrabold text-[#1A1A2E] leading-none">{weather.temp}°<span className="text-xl align-top">C</span></div>
                    <p className="text-[#6B7280] font-bold capitalize text-lg mt-1">{weather.condition}</p>
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-[#1A1A2E] flex items-center gap-2">
                  <span className="bg-white/50 px-3 py-1 rounded-full">Feels like {weather.feels_like}°C</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/60 p-4 rounded-2xl border border-[#E2E4F0]">
                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Humidity</p>
                    <p className="text-lg font-bold">{weather.humidity}%</p>
                  </div>
                  <div className="bg-white/60 p-4 rounded-2xl border border-[#E2E4F0]">
                    <p className="text-[10px] font-black text-[#9CA3AF] uppercase">Wind</p>
                    <p className="text-lg font-bold">{weather.wind} km/h</p>
                  </div>
                </div>

                <div className="flex justify-between p-4 bg-white/40 rounded-2xl border border-[#E2E4F0] text-sm">
                  <div className="flex items-center gap-2 font-semibold">🌅 {weather.sunrise}</div>
                  <div className="flex items-center gap-2 font-semibold">🌇 {weather.sunset}</div>
                </div>

                <div className="p-4 bg-[#7C3AED]/5 rounded-2xl border border-[#7C3AED]/20">
                  <p className="text-[10px] font-bold text-[#7C3AED] uppercase mb-1">Today&apos;s Advice</p>
                  <p className="text-[#1A1A2E] font-semibold text-sm leading-relaxed">{getWeatherTip(weather.temp, weather.condition)}</p>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                {showCitySearch ? (
                  <div className="space-y-3">
                    <input 
                      value={cityInput}
                      onChange={e => setCityInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
                      placeholder="Enter city (e.g. Coimbatore)"
                      className="text-sm"
                    />
                    <button onClick={handleCitySearch} className="btn-primary w-full py-2.5 text-sm">Search City</button>
                  </div>
                ) : weatherError && (
                  <div className="text-center p-4">
                    <p className="text-red-500 text-xs mb-3">{weatherError}</p>
                    <button onClick={() => setShowCitySearch(true)} className="text-[#7C3AED] text-xs font-bold underline">Search Manually</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Intelligence Card */}
          <div className="card">
            <h3 className="text-sm font-black text-[#9CA3AF] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#7C3AED]" /> Wardrobe Intelligence
            </h3>
            {analysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#F3F4FF] rounded-xl border border-[#E2E4F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] font-black">
                      {analysis.analysis.summary.wardrobe_score}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#6B7280] uppercase">Score</p>
                      <p className="text-xs font-bold text-[#1A1A2E]">Readiness</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <Link href="/wardrobe" className="btn-primary py-3 text-sm">
                  Full Analysis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <Link href="/wardrobe" className="btn-secondary w-full block text-center text-sm">Analyze Collection</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
