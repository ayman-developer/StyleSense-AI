"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Cloud, CloudRain, Sun, Wind, Droplets, MapPin,
  Loader2, Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Thermometer
} from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold tracking-tight mb-1">
          Welcome back, {user?.displayName?.split(" ")[0] || "Stylist"}! 👋
        </h1>
        <p className="text-zinc-400 text-lg">Let&apos;s find the perfect outfit for your day.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-zinc-300">
            <MapPin className="w-4 h-4 text-purple-400" /> Current Weather
          </h2>

          {weatherLoading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-zinc-500 text-sm">Getting location...</p>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getWeatherIcon(weather.condition)}
                <div>
                  <div className="text-3xl font-light">{weather.temp}°C</div>
                  <div className="text-zinc-500 text-sm capitalize">{weather.condition}</div>
                </div>
              </div>
              <div className="text-sm font-medium text-zinc-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> {weather.city}
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800">
                <div className="text-center">
                  <Thermometer className="w-4 h-4 mx-auto text-orange-400 mb-1" />
                  <div className="text-xs text-zinc-500">Feels</div>
                  <div className="text-sm font-medium">{weather.feels_like}°</div>
                </div>
                <div className="text-center">
                  <Droplets className="w-4 h-4 mx-auto text-blue-400 mb-1" />
                  <div className="text-xs text-zinc-500">Humidity</div>
                  <div className="text-sm font-medium">{weather.humidity}%</div>
                </div>
                <div className="text-center">
                  <Wind className="w-4 h-4 mx-auto text-teal-400 mb-1" />
                  <div className="text-xs text-zinc-500">Wind</div>
                  <div className="text-sm font-medium">{weather.wind}km/h</div>
                </div>
              </div>
              <button
                onClick={handleGetLocation}
                className="w-full text-xs text-purple-400 hover:text-purple-300 transition-colors py-1"
              >
                Refresh Location
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <MapPin className="w-10 h-10 text-zinc-700" />
              <p className="text-zinc-400 text-sm">Weather is based on your location.</p>
              {weatherError && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-left">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-xs">{weatherError}</p>
                </div>
              )}
              <button
                onClick={handleGetLocation}
                disabled={weatherLoading}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-sm font-medium transition-all active:scale-95"
              >
                Get Weather for My Location
              </button>
            </div>
          )}
        </div>

        {/* Occasion & Generator */}
        <div className="md:col-span-2 space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-zinc-300">Where are you heading?</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {OCCASIONS.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    occasion === occ
                      ? "bg-white text-black border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                      : "bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            {/* Weather prompt if missing */}
            {!weather && outfitError && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-amber-400 text-sm">{outfitError}</p>
              </div>
            )}
            {outfitError && weather && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{outfitError}</p>
              </div>
            )}

            <button
              onClick={handleGenerateOutfit}
              disabled={generating}
              className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-[0.98]"
            >
              {generating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Styling your look...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Generate Outfit</>
              )}
            </button>
          </div>

          {/* Outfit Result Card */}
          {outfit && (
            <div className="bg-zinc-900 border border-zinc-800 border-t-4 border-t-pink-500 rounded-2xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your {occasion} Outfit
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  { emoji: "👕", label: "Top", value: outfit.top },
                  { emoji: "👖", label: "Bottom", value: outfit.bottom },
                  { emoji: "👟", label: "Footwear", value: outfit.footwear },
                  { emoji: "👜", label: "Accessory", value: outfit.accessory },
                  ...(outfit.outerwear ? [{ emoji: "🧥", label: "Outerwear", value: outfit.outerwear }] : []),
                  { emoji: "🎨", label: "Colors", value: outfit.colors },
                ].map(({ emoji, label, value }) => (
                  <div key={label} className="bg-black/40 border border-zinc-800 rounded-xl p-3">
                    <div className="text-xs text-zinc-500 mb-1">{emoji} {label}</div>
                    <div className="text-sm text-zinc-200">{value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 mb-5">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <span className="text-purple-400 text-xs font-semibold uppercase tracking-wide">💡 Styling Tip</span>
                  <p className="text-sm text-zinc-300 mt-1">{outfit.tip}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <span className="text-red-400 text-xs font-semibold uppercase tracking-wide">❌ Avoid</span>
                  <p className="text-sm text-zinc-300 mt-1">{outfit.avoid}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <span className="text-sm text-zinc-500">How&apos;s this outfit?</span>
                {feedbackSent ? (
                  <span className="text-sm text-purple-400 font-medium">✓ Thanks for your feedback!</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFeedback("like")}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 hover:bg-green-500/20 transition-all text-sm"
                    >
                      <ThumbsUp className="w-4 h-4" /> Love it
                    </button>
                    <button
                      onClick={() => handleFeedback("dislike")}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all text-sm"
                    >
                      <ThumbsDown className="w-4 h-4" /> Not for me
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
