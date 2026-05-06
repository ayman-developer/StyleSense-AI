"use client";

import { 
  CheckCircle2, AlertTriangle, ArrowRight, IndianRupee, 
  ShoppingBag, Sparkles, TrendingUp, Calendar, Zap, Info 
} from "lucide-react";
import Image from "next/image";

type Props = {
  data: any;
  wardrobeItems: any[];
};

export function WardrobeAnalysisResults({ data, wardrobeItems }: Props) {
  if (!data) return null;

  const getScoreColor = (score: number) => {
    if (score > 80) return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    if (score > 50) return "text-amber-400 border-amber-500/20 bg-amber-500/5";
    return "text-rose-400 border-rose-500/20 bg-rose-500/5";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case 'medium': return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getItemImage = (itemName: string) => {
    const item = wardrobeItems.find(i => i.name === itemName || i.category === itemName);
    return item?.image_url || null;
  };

  return (
    <div className="space-y-12 py-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">AI Wardrobe Analysis</h2>
      </div>

      {/* SECTION 1: SCORE & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-4 rounded-[40px] border p-10 flex flex-col items-center justify-center text-center ${getScoreColor(data.summary.wardrobe_score)}`}>
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96" cy="96" r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * data.summary.wardrobe_score) / 100}
                className="opacity-100 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
              <circle
                cx="96" cy="96" r="88"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="12"
                className="opacity-10"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black">{data.summary.wardrobe_score}</span>
              <span className="text-xs font-bold uppercase tracking-widest opacity-60">Score</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Overall Readiness</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">{data.summary.score_reason}</p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Season Coverage
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-emerald-400 font-bold mb-2">WELL COVERED</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.well_covered_seasons.map((s: string) => (
                    <span key={s} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-rose-400 font-bold mb-2">GAPS DETECTED</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.weak_seasons.map((s: string) => (
                    <span key={s} className="px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Occasion Stats
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-blue-400 font-bold mb-2">READY FOR</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.well_covered_occasions.map((o: string) => (
                    <span key={o} className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-xs font-bold">{o}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-bold mb-2">LACKS VARIETY IN</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.weak_occasions.map((o: string) => (
                    <span key={o} className="px-4 py-2 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xl text-xs font-bold">{o}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WEATHER READINESS */}
      <div className="relative rounded-[40px] overflow-hidden bg-zinc-900/50 border border-zinc-800 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          {data.weather_readiness.current_weather_ready ? <CheckCircle2 className="w-40 h-40" /> : <AlertTriangle className="w-40 h-40" />}
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 ${data.weather_readiness.current_weather_ready ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {data.weather_readiness.current_weather_ready ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {data.weather_readiness.current_weather_ready ? 'Weather Ready' : 'Wardrobe Gap Detected'}
            </div>
            <h3 className="text-4xl font-bold mb-4">Today&apos;s Forecast</h3>
            <p className="text-zinc-400 text-lg mb-8">{data.weather_readiness.current_weather_message}</p>
            
            <div className="flex items-center gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-xs text-zinc-500 font-bold uppercase">Options</p>
                  <p className="text-xl font-bold">{data.weather_readiness.outfits_possible_today} Combinations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 w-full">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Best Pick for Today</p>
            <div className="grid grid-cols-3 gap-3">
              {['top', 'bottom', 'footwear'].map(cat => {
                const img = getItemImage(data.weather_readiness.best_outfit_for_today[cat]);
                return (
                  <div key={cat} className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-zinc-800 group">
                    {img ? (
                      <Image src={img} alt={cat} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <span className="text-[10px] font-bold text-zinc-700 uppercase">{cat} Missing</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black text-[9px] font-bold text-white uppercase text-center">
                      {data.weather_readiness.best_outfit_for_today[cat]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-purple-600/10 rounded-2xl border border-purple-500/20 flex gap-3">
              <Info className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-sm text-zinc-300">{data.weather_readiness.best_outfit_for_today.reason}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: MISSING ITEMS */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-bold">Recommended Additions</h3>
            <p className="text-zinc-500 mt-1">Strategic pieces to complete your style</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.missing_items.map((item: any, i: number) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8 hover:border-zinc-700 transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getPriorityColor(item.priority)}`}>
                  {item.priority} Priority
                </span>
                <span className="text-zinc-500 text-xs font-bold">{item.category}</span>
              </div>
              
              <h4 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">{item.item}</h4>
              <p className="text-zinc-400 text-sm mb-6 flex-grow">{item.reason}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-500">COLOR</span>
                  <span className="text-zinc-200">{item.color_suggestion}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-500">FABRIC</span>
                  <span className="text-zinc-200">{item.fabric_suggestion}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-500">BUDGET</span>
                  <span className="text-purple-400 flex items-center"><IndianRupee className="w-3 h-3" />{item.estimated_budget}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a 
                  href={`https://www.myntra.com/${item.item.toLowerCase().replace(/ /g, '-')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-900 transition-all"
                >
                  Myntra
                </a>
                <a 
                  href={`https://www.amazon.in/s?k=${item.item.toLowerCase().replace(/ /g, '+')}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-zinc-900 transition-all"
                >
                  Amazon
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: OUTFIT COMBINATIONS */}
      <div>
        <h3 className="text-3xl font-bold mb-8">Ready-to-Wear Combinations</h3>
        <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
          {data.outfit_combinations.map((combo: any, i: number) => (
            <div key={i} className="min-w-[320px] md:min-w-[400px] bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[40px] p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold">{combo.name}</h4>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-500/20">{combo.occasion}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                {['top', 'bottom', 'footwear'].map(key => (
                  <div key={key} className="w-full aspect-[3/4] bg-zinc-950 rounded-2xl overflow-hidden relative border border-zinc-800">
                    {getItemImage(combo.items[key]) ? (
                      <Image src={getItemImage(combo.items[key])!} alt={key} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[9px] text-zinc-700 font-bold uppercase">{combo.items[key]}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex gap-3 italic text-sm text-zinc-400">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                &quot;{combo.tip}&quot;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: SHOPPING LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "URGENT", list: data.shopping_list.urgent, color: "text-rose-400" },
          { title: "SOON", list: data.shopping_list.soon, color: "text-amber-400" },
          { title: "OPTIONAL", list: data.shopping_list.optional, color: "text-zinc-500" },
        ].map((col, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-8">
            <h4 className={`text-xs font-black uppercase tracking-widest mb-6 ${col.color}`}>{col.title}</h4>
            <div className="space-y-3">
              {col.list.map((item: string) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800 group hover:border-zinc-600 transition-colors">
                  <div className="w-5 h-5 rounded-md border-2 border-zinc-800 flex items-center justify-center group-hover:border-purple-500 transition-colors">
                    <CheckCircle2 className="w-3 h-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 6: STYLE INSIGHTS */}
      <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-[40px] p-10">
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400" /> Professional Style Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.style_insights.map((insight: string, i: number) => (
            <div key={i} className="flex gap-4 p-6 bg-black/40 rounded-3xl border border-white/5">
              <span className="text-purple-400 font-black text-2xl opacity-20">0{i+1}</span>
              <p className="text-zinc-300 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
