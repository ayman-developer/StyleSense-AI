"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Cloud, CloudRain, Sun, Wind, Droplets, MapPin,
  Loader2, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, 
  Thermometer, Zap, ArrowRight, ShoppingBag, TrendingUp, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Weather = {
  city: string;
  temp: number;
  feels_like: number;
  condition: string;
  humidity: number;
  wind: number;
  icon: string;
};

type Outfit = {
  top: string;
  bottom: string;
  footwear: string;
  accessory: string;
  outerwear?: string | null;
  colors: string;
  tip: string;
  avoid: string;
};

const OCCASIONS = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival"];

export default function Dashboard() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [occasion, setOccasion] = useState("Casual");
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [generating, setGenerating] = useState(false);
  const [outfitError, setOutfitError] = useState<string | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  
  // New: Wardrobe Intelligence State
  const [analysis, setAnalysis] = useState<any>(null);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);

  useEffect(() => {
    if (user?.uid) {
      fetchAnalysis();
      fetchWardrobe();
      handleGetLocation(); // Auto-fetch weather on mount
    }
  }, [user?.uid]);

  const fetchAnalysis = async () => {
    try {
      const { data } = await (await fetch(`/api/user/preferences?userId=${user?.uid}`)).json();
      // Assuming analysis is stored or we fetch it from a dedicated endpoint
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

  const handleGetLocation = () => {
    setWeatherLoading(true);
    setWeatherError(null);
    if (!navigator.geolocation) {
      setWeatherError("Geolocation is not supported by your browser.");
      setWeatherLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `/api/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await res.json();
          if (!res.ok || data.error) throw new Error(data.error || "Weather API failed");
          setWeather(data);
        } catch (err: any) {
          setWeatherError(err.message || "Failed to fetch weather. Check your API key.");
          console.error(err);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherError("Location access denied. Please allow location in your browser.");
        setWeatherLoading(false);
      }
    );
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
        body: JSON.stringify({ weather, occasion }),
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

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="w-10 h-10 text-blue-400" />;
    if (c.includes("cloud") || c.includes("overcast")) return <Cloud className="w-10 h-10 text-zinc-400" />;
    if (c.includes("clear") || c.includes("sun")) return <Sun className="w-10 h-10 text-yellow-400" />;
    return <Wind className="w-10 h-10 text-teal-400" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto px-4 md:px-0">
      {/* Smart Daily Banner */}
      {weather && wardrobeItems.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-zinc-900/40 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center">
              {getWeatherIcon(weather.condition)}
            </div>
            <div>
              <p className="text-zinc-300 font-medium leading-relaxed">
                It&apos;s {weather.temp}°C and {weather.condition} today. <br />
                <span className="text-white font-bold">You have clothes in your wardrobe for this!</span>
              </p>
            </div>
          </div>
          <Link href="/wardrobe" className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 whitespace-nowrap shadow-xl">
            See Best Picks <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            Styling <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Dashboard</span>
          </h1>
          <p className="text-zinc-500 text-lg">Personalized fashion intelligence for {user?.displayName?.split(" ")[0] || "Stylist"}.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Generator Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Outfit Generator
              </h2>
              {weather && (
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-medium">
                  <MapPin className="w-4 h-4 text-pink-500" /> {weather.city}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">The Occasion</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setOccasion(occ)}
                      className={`px-6 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                        occasion === occ
                          ? "bg-white text-black border-white shadow-xl shadow-white/5"
                          : "bg-black/40 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {!weather && (
                <div className="p-6 bg-purple-600/5 border border-dashed border-purple-500/20 rounded-2xl text-center">
                  <p className="text-zinc-400 text-sm mb-4">We need your current weather to suggest the perfect outfit.</p>
                  <button
                    onClick={handleGetLocation}
                    disabled={weatherLoading}
                    className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-100 transition-all flex items-center gap-2 mx-auto"
                  >
                    {weatherLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    Get My Location
                  </button>
                </div>
              )}

              {outfitError && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5" /> {outfitError}
                </div>
              )}

              {weather && (
                <button
                  onClick={handleGenerateOutfit}
                  disabled={generating}
                  className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all disabled:opacity-60 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white shadow-2xl shadow-purple-900/20 active:scale-95"
                >
                  {generating ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> STYLING...</>
                  ) : (
                    <><Zap className="w-6 h-6" /> GENERATE OUTFIT</>
                  )}
                </button>
              )}
            </div>

            {/* Outfit Result */}
            {outfit && (
              <div className="mt-10 p-8 bg-zinc-950 border border-zinc-800 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
                  <h3 className="text-2xl font-bold text-white">Suggested Ensemble</h3>
                  <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400 text-xs font-black uppercase tracking-widest">{occasion}</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    {[
                      { l: "Top", v: outfit.top, e: "👕" },
                      { l: "Bottom", v: outfit.bottom, e: "👖" },
                      { l: "Footwear", v: outfit.footwear, e: "👟" },
                      { l: "Accessory", v: outfit.accessory, e: "👜" },
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
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-3xl h-full">
                      <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Professional Tip</p>
                      <p className="text-zinc-200 italic leading-relaxed">&quot;{outfit.tip}&quot;</p>
                      <div className="mt-6 pt-6 border-t border-purple-500/10">
                         <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Avoid</p>
                         <p className="text-zinc-400 text-sm">{outfit.avoid}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-500 font-medium">How did we do?</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleFeedback('like')} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"><ThumbsUp className="w-5 h-5" /></button>
                    <button onClick={() => handleFeedback('dislike')} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all"><ThumbsDown className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* Weather Widget */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Cloud className="w-32 h-32" />
             </div>
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Current Local</h3>
             
             {weather ? (
               <div className="space-y-6">
                 <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center">
                     {getWeatherIcon(weather.condition)}
                   </div>
                   <div>
                     <p className="text-5xl font-black text-white">{weather.temp}°</p>
                     <p className="text-zinc-500 font-bold capitalize mt-1">{weather.condition}</p>
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Humidity</p>
                     <p className="text-xl font-bold">{weather.humidity}%</p>
                   </div>
                   <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Wind</p>
                     <p className="text-xl font-bold">{weather.wind}km/h</p>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="py-8 text-center">
                 <p className="text-zinc-600 text-sm">No weather data yet</p>
               </div>
             )}
          </div>

          {/* Wardrobe Intelligence Preview */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
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

                <div className="space-y-3">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Priority Gaps</p>
                  {analysis.analysis.missing_items.slice(0, 2).map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                      <span className="text-sm font-medium text-zinc-300">{item.item}</span>
                      <span className="text-[10px] font-black px-2 py-1 bg-rose-500/10 text-rose-500 rounded uppercase">High</span>
                    </div>
                  ))}
                </div>

                <Link href="/wardrobe" className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500 transition-all">
                  Full Analysis <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 bg-zinc-950 rounded-full flex items-center justify-center mx-auto border border-dashed border-zinc-800">
                  <TrendingUp className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-zinc-500 text-sm">Analyze your collection to see style gaps and readiness scores.</p>
                <Link href="/wardrobe" className="block w-full py-3 bg-zinc-800 text-white rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">
                  Go to Wardrobe
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
