"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [stylePersonality, setStylePersonality] = useState("Minimalist");
  const [colors, setColors] = useState<string[]>([]);
  const [fit, setFit] = useState("Tailored");
  const [budget, setBudget] = useState("Mid-range");
  const [loading, setLoading] = useState(false);

  const styleOptions = ["Minimalist", "Streetwear", "Classic", "Bohemian", "Gothic", "Preppy", "Vintage"];
  const colorOptions = ["Black", "White", "Navy", "Beige", "Red", "Olive", "Pastels", "Neon"];
  const fitOptions = ["Tailored", "Relaxed", "Oversized", "Slim Fit"];
  const budgetOptions = ["Affordable", "Mid-range", "Premium"];

  const toggleColor = (c: string) => {
    if (colors.includes(c)) setColors(colors.filter(col => col !== c));
    else setColors([...colors, c]);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);

    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          stylePersonality,
          favoriteColors: colors,
          fitPreference: fit,
          budgetPreference: budget
        })
      });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom-8">
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Define Your Style</h1>
          <p className="text-zinc-400">Help StyleSense AI learn about your unique taste.</p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-3">Style Personality</h3>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStylePersonality(opt)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${stylePersonality === opt ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Favorite Colors</h3>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleColor(opt)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${colors.includes(opt) ? 'bg-purple-600 text-white border-purple-600' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Fit Preference</h3>
            <div className="flex flex-wrap gap-2">
              {fitOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setFit(opt)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${fit === opt ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Budget Preference</h3>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setBudget(opt)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${budget === opt ? 'bg-white text-black border-white' : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-10 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Profile"}
          {!loading && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
