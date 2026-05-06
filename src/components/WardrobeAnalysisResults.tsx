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
    if (score > 80) return "text-emerald-600 border-emerald-100 bg-emerald-50";
    if (score > 50) return "text-amber-600 border-amber-100 bg-amber-50";
    return "text-rose-600 border-rose-100 bg-rose-50";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return "bg-rose-50 text-rose-600 border-rose-100";
      case 'medium': return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-[#F3F4FF] text-[#6B7280] border-[#E2E4F0]";
    }
  };

  const getItemImage = (itemName: string) => {
    const item = wardrobeItems.find(i => i.name === itemName || i.category === itemName);
    return item?.image_url || null;
  };

  return (
    <div className="space-y-12 py-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#1A1A2E]">AI Analysis Report</h2>
      </div>

      {/* SECTION 1: SCORE & SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-4 rounded-[32px] border p-8 flex flex-col items-center justify-center text-center ${getScoreColor(data.summary.wardrobe_score)} shadow-sm`}>
          <div className="relative w-40 h-40 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="74" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray={465} strokeDashoffset={465 - (465 * data.summary.wardrobe_score) / 100} className="opacity-100 transition-all duration-1000 ease-out" strokeLinecap="round" />
              <circle cx="80" cy="80" r="74" fill="transparent" stroke="currentColor" strokeWidth="12" className="opacity-10" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-[#1A1A2E]">{data.summary.wardrobe_score}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#6B7280]">Score</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Wardrobe Health</h3>
          <p className="text-[#6B7280] text-sm leading-relaxed">{data.summary.score_reason}</p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card shadow-sm border-[#E2E4F0]">
            <span className="section-label flex items-center gap-2"><Calendar className="w-4 h-4" /> Season Coverage</span>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-emerald-600 font-black mb-2 uppercase">Strong Preparedness</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.well_covered_seasons.map((s: string) => (
                    <span key={s} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-rose-500 font-black mb-2 uppercase">Lacks Variety</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.weak_seasons.map((s: string) => (
                    <span key={s} className="px-3 py-1.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-xl text-xs font-bold">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-[#E2E4F0]">
            <span className="section-label flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Lifestyle Gaps</span>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-blue-600 font-black mb-2 uppercase">Well Stocked</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.well_covered_occasions.map((o: string) => (
                    <span key={o} className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold">{o}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#6B7280] font-black mb-2 uppercase">Missing Pieces</p>
                <div className="flex flex-wrap gap-2">
                  {data.summary.weak_occasions.map((o: string) => (
                    <span key={o} className="px-3 py-1.5 bg-[#F3F4FF] text-[#6B7280] border border-[#E2E4F0] rounded-xl text-xs font-bold">{o}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: WEATHER READINESS */}
      <div className="card bg-gradient-to-br from-[#F3F4FF] to-white border-[#DDD6FE] p-8 md:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${data.weather_readiness.current_weather_ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {data.weather_readiness.current_weather_ready ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {data.weather_readiness.current_weather_ready ? 'Weather Ready' : 'Wardrobe Gap Detected'}
            </div>
            <h3 className="text-3xl font-black text-[#1A1A2E] mb-3">Today&apos;s Match</h3>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-6">{data.weather_readiness.current_weather_message}</p>
            <div className="p-4 bg-white/60 rounded-2xl border border-[#E2E4F0] flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#7C3AED]" />
              <p className="text-sm font-bold text-[#1A1A2E]">{data.weather_readiness.outfits_possible_today} Perfect Combos Possible</p>
            </div>
          </div>

          <div className="md:w-1/2 w-full">
            <span className="section-label">Best Wardrobe Pick</span>
            <div className="grid grid-cols-3 gap-3">
              {['top', 'bottom', 'footwear'].map(cat => {
                const img = getItemImage(data.weather_readiness.best_outfit_for_today[cat]);
                return (
                  <div key={cat} className="relative aspect-[3/4] bg-[#F8F9FF] rounded-2xl overflow-hidden border border-[#E2E4F0] shadow-sm">
                    {img ? (
                      <Image src={img} alt={cat} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[10px] font-bold text-[#9CA3AF] uppercase">{cat}</div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 p-2 bg-white/90 backdrop-blur-sm text-[8px] font-black text-[#1A1A2E] uppercase text-center border-t border-[#E2E4F0]">
                      {data.weather_readiness.best_outfit_for_today[cat]}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-[#7C3AED]/5 rounded-2xl border border-[#7C3AED]/10 text-sm text-[#1A1A2E] font-medium italic">
              &quot;{data.weather_readiness.best_outfit_for_today.reason}&quot;
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: MISSING ITEMS */}
      <div>
        <h3 className="text-2xl font-extrabold text-[#1A1A2E] mb-6">Strategic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.missing_items.map((item: any, i: number) => (
            <div key={i} className="card hover:border-[#7C3AED] transition-all flex flex-col h-full shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(item.priority)}`}>
                  {item.priority}
                </span>
                <span className="text-[#9CA3AF] text-[10px] font-black uppercase">{item.category}</span>
              </div>
              <h4 className="text-xl font-extrabold text-[#1A1A2E] mb-2">{item.item}</h4>
              <p className="text-[#6B7280] text-sm mb-6 flex-grow">{item.reason}</p>
              <div className="space-y-3 mb-6 pt-4 border-t border-[#F8F9FF]">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[#9CA3AF]">COLOR</span>
                  <span className="text-[#1A1A2E]">{item.color_suggestion}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[#9CA3AF]">FABRIC</span>
                  <span className="text-[#1A1A2E]">{item.fabric_suggestion}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[#9CA3AF]">EST. BUDGET</span>
                  <span className="text-[#7C3AED] flex items-center"><IndianRupee className="w-3 h-3" />{item.estimated_budget}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`https://www.myntra.com/${item.item.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noreferrer" className="btn-secondary py-2 text-[11px] font-bold text-center">Myntra</a>
                <a href={`https://www.amazon.in/s?k=${item.item.toLowerCase().replace(/ /g, '+')}`} target="_blank" rel="noreferrer" className="btn-secondary py-2 text-[11px] font-bold text-center">Amazon</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: SHOPPING LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "BUY NOW", list: data.shopping_list.urgent, color: "text-rose-600" },
          { title: "SOON", list: data.shopping_list.soon, color: "text-amber-600" },
          { title: "WISH LIST", list: data.shopping_list.optional, color: "text-[#9CA3AF]" },
        ].map((col, i) => (
          <div key={i} className="card shadow-sm border-[#E2E4F0]">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${col.color}`}>{col.title}</h4>
            <div className="space-y-2">
              {col.list.map((item: string) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-[#F8F9FF] rounded-xl border border-[#E2E4F0] group cursor-pointer hover:border-[#7C3AED] transition-colors">
                  <div className="w-4 h-4 rounded-md border-2 border-[#E2E4F0] group-hover:border-[#7C3AED] transition-colors" />
                  <span className="text-xs font-semibold text-[#6B7280] group-hover:text-[#1A1A2E]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
