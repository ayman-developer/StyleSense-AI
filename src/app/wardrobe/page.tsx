"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  Upload, Trash2, Loader2, Plus, X, Filter, Sparkles, 
  Search, CheckCircle2, ShoppingBag, Info, AlertTriangle,
  ArrowRight, IndianRupee, Zap
} from "lucide-react";
import Image from "next/image";
import { WardrobeAnalysisResults } from "@/components/WardrobeAnalysisResults";

type WardrobeItem = {
  id: string;
  name: string;
  image_url: string;
  category: string;
  color: string;
  fabric: string;
  fit: string;
  warmth_level: string;
  season: string[];
  occasion_tags: string[];
  times_worn: number;
};

type UploadingItem = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  tags?: Partial<WardrobeItem>;
};

const CATEGORIES = ["Top", "Bottom", "Dress/One-piece", "Footwear", "Accessory", "Outerwear", "Traditional", "Sportswear"];
const SEASONS = ["Summer", "Winter", "Monsoon", "Spring", "All Season"];
const OCCASIONS = ["Casual", "Office", "Formal", "Party", "Date Night", "Gym", "Travel", "Festival", "Traditional"];
const FABRICS = ["Cotton", "Linen", "Polyester", "Silk", "Wool", "Denim", "Chiffon", "Velvet", "Other"];
const FITS = ["Slim", "Regular", "Loose", "Oversized"];
const WARMTH = ["Light", "Medium", "Heavy"];

export default function WardrobePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [seasonFilter, setSeasonFilter] = useState("All");
  const [occasionFilter, setOccasionFilter] = useState("All");
  
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/wardrobe?userId=${user.uid}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newUploads = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading' as const,
      tags: {
        name: file.name.split('.')[0],
        category: 'Top',
        color: '#000000',
        fabric: 'Cotton',
        fit: 'Regular',
        warmth_level: 'Light',
        season: ['All Season'],
        occasion_tags: ['Casual'],
        times_worn: 0
      }
    }));
    setUploadingItems(prev => [...prev, ...newUploads]);
    setShowUploadModal(true);
    
    // Start uploading each file
    newUploads.forEach(item => uploadFile(item));
  };

  const uploadFile = async (item: UploadingItem) => {
    const formData = new FormData();
    formData.append("file", item.file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      setUploadingItems(prev => prev.map(u => 
        u.id === item.id ? { ...u, status: 'success', progress: 100, tags: { ...u.tags, image_url: data.url, cloudinary_public_id: data.public_id } } : u
      ));
    } catch (e) {
      setUploadingItems(prev => prev.map(u => 
        u.id === item.id ? { ...u, status: 'error' } : u
      ));
    }
  };

  const handleTagChange = (id: string, field: string, value: any) => {
    setUploadingItems(prev => prev.map(u => 
      u.id === id ? { ...u, tags: { ...u.tags, [field]: value } } : u
    ));
  };

  const toggleMultiSelect = (id: string, field: 'season' | 'occasion_tags', value: string) => {
    setUploadingItems(prev => prev.map(u => {
      if (u.id !== id) return u;
      const current = (u.tags?.[field] as string[]) || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...u, tags: { ...u.tags, [field]: updated } };
    }));
  };

  const saveAll = async () => {
    if (!user?.uid) return;
    const readyItems = uploadingItems.filter(u => u.status === 'success');
    if (readyItems.length === 0) return;

    try {
      await Promise.all(readyItems.map(item => 
        fetch("/api/wardrobe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.uid,
            ...item.tags
          }),
        })
      ));
      
      setShowUploadModal(false);
      setUploadingItems([]);
      fetchItems();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item?")) return;
    try {
      await fetch(`/api/wardrobe?id=${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const runAnalysis = async () => {
    if (!user?.uid || items.length === 0) return;
    setAnalysisLoading(true);
    setAnalysisData(null);
    try {
      // Get location/weather first
      const pos: any = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      const weatherRes = await fetch(`/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      const weather = await weatherRes.json();

      const res = await fetch("/api/wardrobe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, weather, location: weather.city }),
      });
      const data = await res.json();
      setAnalysisData(data);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = filter === "All" || item.category === filter;
    const matchesSeason = seasonFilter === "All" || item.season.includes(seasonFilter) || item.season.includes("All Season");
    const matchesOccasion = occasionFilter === "All" || item.occasion_tags.includes(occasionFilter);
    return matchesCat && matchesSeason && matchesOccasion;
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-950 p-8 md:p-12 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Wardrobe <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Intelligence</span>
          </h1>
          <p className="text-zinc-300 text-lg mb-8 leading-relaxed">
            Upload your dress collection and let our AI analyze your style gaps, weather readiness, and provide a personalized shopping list to complete your look.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-zinc-100 transition-all active:scale-95 shadow-xl"
            >
              <Plus className="w-5 h-5" /> Bulk Upload Collection
            </button>
            <button
              onClick={runAnalysis}
              disabled={analysisLoading || items.length === 0}
              className="flex items-center gap-2 px-8 py-4 bg-purple-600/20 backdrop-blur-md border border-purple-500/30 text-white rounded-2xl font-bold hover:bg-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {analysisLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-purple-400" />}
              Analyze My Wardrobe
            </button>
          </div>
          <input 
            ref={fileInputRef} 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            onChange={e => handleFiles(e.target.files)} 
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: items.length, icon: ShoppingBag, color: "text-blue-400" },
          { label: "Tops", value: items.filter(i => i.category === 'Top').length, icon: Zap, color: "text-amber-400" },
          { label: "Bottoms", value: items.filter(i => i.category === 'Bottom').length, icon: Zap, color: "text-emerald-400" },
          { label: "Shoes", value: items.filter(i => i.category === 'Footwear').length, icon: Zap, color: "text-rose-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Analysis Results Section */}
      <div id="analysis-results">
        {analysisData && <WardrobeAnalysisResults data={analysisData} wardrobeItems={items} />}
      </div>

      {/* Main Wardrobe Grid & Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["All", ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                  filter === cat ? "bg-white text-black border-white" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <select 
              value={seasonFilter} 
              onChange={e => setSeasonFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 ring-purple-500/20"
            >
              <option value="All">All Seasons</option>
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-zinc-500 font-medium">Loading your collection...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold mb-2">No items found</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Start building your smart wardrobe by uploading your clothes. We&apos;ll help you style them!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-zinc-600 hover:shadow-2xl transition-all duration-300">
                <div className="relative aspect-[3/4]">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="w-full py-2 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/40 transition-all"
                    >
                      Delete Item
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-100 truncate">{item.name}</h4>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-500/20">
                      {item.category}
                    </span>
                    {item.season.slice(0, 2).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg border border-blue-500/20">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => !uploadingItems.some(i => i.status === 'uploading') && setShowUploadModal(false)} />
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Tag Your Collection</h2>
                <p className="text-zinc-500 text-sm">{uploadingItems.length} items being added</p>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {uploadingItems.map((item) => (
                <div key={item.id} className="flex flex-col lg:flex-row gap-8 bg-zinc-900/30 p-6 rounded-3xl border border-zinc-800">
                  <div className="w-full lg:w-48 aspect-square relative rounded-2xl overflow-hidden shrink-0 border border-zinc-800">
                    <Image src={item.preview} alt="Preview" fill className="object-cover" />
                    {item.status === 'uploading' && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                        <span className="text-xs font-bold text-white">Uploading...</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Item Name</label>
                        <input 
                          value={item.tags?.name}
                          onChange={e => handleTagChange(item.id, 'name', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 ring-purple-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Category</label>
                        <select 
                          value={item.tags?.category}
                          onChange={e => handleTagChange(item.id, 'category', e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm"
                        >
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Color & Fabric</label>
                        <div className="flex gap-2">
                          <input 
                            type="color"
                            value={item.tags?.color}
                            onChange={e => handleTagChange(item.id, 'color', e.target.value)}
                            className="w-12 h-10 bg-zinc-900 border border-zinc-800 rounded-xl p-1 cursor-pointer"
                          />
                          <select 
                            value={item.tags?.fabric}
                            onChange={e => handleTagChange(item.id, 'fabric', e.target.value)}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm"
                          >
                            {FABRICS.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Fit</label>
                          <select value={item.tags?.fit} onChange={e => handleTagChange(item.id, 'fit', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
                            {FITS.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Warmth</label>
                          <select value={item.tags?.warmth_level} onChange={e => handleTagChange(item.id, 'warmth_level', e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm">
                            {WARMTH.map(w => <option key={w}>{w}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Seasons</label>
                        <div className="flex flex-wrap gap-1.5">
                          {SEASONS.map(s => (
                            <button 
                              key={s} 
                              onClick={() => toggleMultiSelect(item.id, 'season', s)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                item.tags?.season?.includes(s) ? "bg-white text-black border-white" : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Occasions</label>
                        <div className="flex flex-wrap gap-1.5">
                          {OCCASIONS.slice(0, 5).map(o => (
                            <button 
                              key={o} 
                              onClick={() => toggleMultiSelect(item.id, 'occasion_tags', o)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                                item.tags?.occasion_tags?.includes(o) ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-900/20" : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
                              }`}
                            >
                              {o}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">
                {uploadingItems.filter(i => i.status === 'success').length} of {uploadingItems.length} items ready
              </span>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-8 py-3 rounded-2xl font-bold border border-zinc-800 text-zinc-400 hover:bg-zinc-900 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveAll}
                  disabled={uploadingItems.some(i => i.status === 'uploading') || uploadingItems.length === 0}
                  className="px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                >
                  Add to Wardrobe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
