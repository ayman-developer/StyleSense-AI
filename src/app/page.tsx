"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px]" />
      
      <main className="max-w-5xl mx-auto px-6 text-center z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm mb-8 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>Your Personal AI Stylist</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8">
          Dress with <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Intelligence
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          StyleSense AI analyzes the weather, your occasion, and your personal taste to curate the perfect outfit every single day.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-full bg-white text-black font-semibold text-lg flex items-center gap-2 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-full bg-transparent border border-zinc-700 text-white font-semibold text-lg hover:bg-zinc-800 transition-all"
          >
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
