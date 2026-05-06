"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#1A1A2E] overflow-hidden relative flex items-center justify-center">
      {/* Premium Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7C3AED]/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#EC4899]/10 blur-[100px]" />
      
      <main className="max-w-5xl mx-auto px-6 text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-[#E2E4F0] text-[#6B7280] text-sm font-semibold mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#EC4899]" />
          <span>Your Personal AI Stylist</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
          Dress with <br />
          <span className="bg-gradient-to-r from-[#7C3AED] via-[#EC4899] to-[#F43F5E] bg-clip-text text-transparent">
            Intelligence
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#6B7280] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          StyleSense AI analyzes the weather, your occasion, and your personal taste to curate the perfect outfit every single day.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link 
            href="/login" 
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-lg flex items-center gap-2 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-200"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="px-10 py-4 rounded-2xl bg-white border border-[#E2E4F0] text-[#1A1A2E] font-bold text-lg hover:bg-[#F3F4FF] transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 pt-10 border-t border-[#E2E4F0]/50 flex flex-wrap justify-center gap-10 opacity-60">
          <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">Smart Wardrobe</span>
          <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">Weather Aware</span>
          <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF]">AI Analysis</span>
        </div>
      </main>
    </div>
  );
}
