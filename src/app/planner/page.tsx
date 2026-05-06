"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Calendar as CalendarIcon, Plus, Loader2, Plane } from "lucide-react";

type Plan = {
  id: string;
  planned_date: string;
  occasion: string;
  notes: string;
};

export default function PlannerPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [occasion, setOccasion] = useState("");
  const [notes, setNotes] = useState("");

  const fetchPlans = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/planner?userId=${user.uid}`);
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !date || !occasion) return;
    setSaving(true);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          plannedDate: date,
          occasion,
          notes,
          outfitItems: [] // Simplified for MVP
        }),
      });
      const newPlan = await res.json();
      setPlans([...plans, newPlan].sort((a, b) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime()));
      setDate("");
      setOccasion("");
      setNotes("");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Outfit Planner</h1>
          <p className="text-zinc-400 text-lg">Plan your looks for upcoming events and trips.</p>
        </div>
        <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-2 hover:bg-zinc-800 transition-colors text-white font-medium">
          <Plane className="w-5 h-5 text-purple-400" /> Pack for a Trip
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Plan Form */}
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-pink-400" /> New Plan
          </h2>
          <form onSubmit={handleAddPlan} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Occasion / Event</label>
              <input 
                type="text" 
                value={occasion} 
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                placeholder="e.g. Sarah's Wedding"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Outfit Notes</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                placeholder="e.g. Wear the navy suit with brown shoes"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={saving || !date || !occasion}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Save Plan
            </button>
          </form>
        </div>

        {/* Timeline */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 mb-6 text-center">
              {error}
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
              No upcoming plans. Start organizing your wardrobe!
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              {plans.map((plan) => (
                <div key={plan.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-zinc-900 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-white text-lg">{plan.occasion}</h3>
                      <time className="text-sm font-medium text-pink-400">{new Date(plan.planned_date).toLocaleDateString()}</time>
                    </div>
                    {plan.notes && <p className="text-zinc-400 text-sm mt-2">{plan.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
