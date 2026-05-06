"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Cloud, CloudRain, Sun, Wind, MapPin, Loader2, Sparkles, Shirt, ThumbsUp, ThumbsDown } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [weather, setWeather] = useState<any>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [occasion, setOccasion] = useState("");
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loadingOutfit, setLoadingOutfit] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const occasions = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival"];

  useEffect(() => {
    // Fetch location and weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            setWeather({
              temp: data.main?.temp || 22,
              humidity: data.main?.humidity || 45,
              main: data.weather?.[0]?.main || "Clear",
              desc: data.weather?.[0]?.description || "clear sky",
              wind: data.wind?.speed || 3.5
            });
          } catch (e) {
            console.error("Failed to fetch weather");
          } finally {
            setLoadingWeather(false);
          }
        },
        () => {
          // fallback weather
          setWeather({ temp: 24, humidity: 50, main: "Clear", desc: "sunny", wind: 2 });
          setLoadingWeather(false);
        }
      );
    } else {
      setLoadingWeather(false);
    }
  }, []);

  const generateOutfit = async () => {
    if (!occasion || !weather) return;
    setLoadingOutfit(true);
    setSuggestion(null);
    setFeedbackSent(false);
    try {
      const res = await fetch("/api/ai/outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather, occasion, preferences: "Modern, sharp, minimalist" })
      });
      const data = await res.json();
      setSuggestion(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOutfit(false);
    }
  };

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (!suggestion || !user?.uid) return;
    try {
      await fetch('/api/outfit/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          weatherSnapshot: weather,
          occasion,
          suggestedOutfit: suggestion,
          feedback: type
        })
      });
      setFeedbackSent(true);
    } catch (e) {
      console.error(e);
    }
  };

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case "rain": return <CloudRain className="w-12 h-12 text-blue-400" />;
      case "clouds": return <Cloud className="w-12 h-12 text-zinc-400" />;
      case "clear": return <Sun className="w-12 h-12 text-yellow-400" />;
      default: return <Wind className="w-12 h-12 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || "Stylist"}!
        </h1>
        <p className="text-zinc-400 text-lg">Let&apos;s find the perfect outfit for your day.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <MapPin className="w-32 h-32" />
          </div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-400" /> Current Weather
          </h2>
          
          {loadingWeather ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : weather ? (
            <div className="flex flex-col items-center text-center space-y-4">
              {getWeatherIcon(weather.main)}
              <div>
                <div className="text-5xl font-light">{Math.round(weather.temp)}°C</div>
                <div className="text-zinc-400 capitalize mt-1">{weather.desc}</div>
              </div>
              <div className="flex gap-4 text-sm text-zinc-500 w-full justify-center pt-4 border-t border-zinc-800">
                <span className="flex items-center gap-1"><CloudRain className="w-4 h-4"/> {weather.humidity}%</span>
                <span className="flex items-center gap-1"><Wind className="w-4 h-4"/> {weather.wind}m/s</span>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">Weather unavailable.</p>
          )}
        </div>

        {/* Occasion & Generator */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Where are you heading?</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`px-4 py-2 rounded-full border transition-all ${
                    occasion === occ 
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : "bg-black text-zinc-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            <button
              onClick={generateOutfit}
              disabled={!occasion || loadingOutfit}
              className="w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              {loadingOutfit ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {loadingOutfit ? "Styling your look..." : "Generate Outfit"}
            </button>
          </div>

          {/* Outfit Result */}
          {suggestion && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl border-t-4 border-t-pink-500 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shirt className="w-6 h-6 text-pink-500" /> Your AI Stylist Recommends
              </h2>
              <div className="bg-black/50 rounded-xl p-5 mb-4 text-lg text-zinc-200 leading-relaxed">
                {suggestion.suggestion}
              </div>
              {suggestion.reasoning && (
                <div className="text-zinc-400 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800 mb-4">
                  <strong className="text-purple-400">Why this works:</strong> {suggestion.reasoning}
                </div>
              )}
              {suggestion.tips && (
                <div className="text-zinc-400 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800">
                  <strong className="text-pink-400">Styling Tips:</strong> {suggestion.tips}
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
                <span className="text-sm text-zinc-400">How did we do?</span>
                {feedbackSent ? (
                  <span className="text-sm text-purple-400 font-medium">Thanks for your feedback!</span>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => handleFeedback('like')} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleFeedback('dislike')} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors">
                      <ThumbsDown className="w-5 h-5" />
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
