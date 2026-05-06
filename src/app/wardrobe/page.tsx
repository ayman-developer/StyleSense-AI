"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { 
  Loader2, Plus, X, Sparkles, 
  ShoppingBag, AlertTriangle, Zap
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
        color: '#7C3AED',
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
    newUploads.forEach(item => uploadFile(item));
  };

  const uploadFile = async (item: UploadingItem) => {
    const formData = new FormData();
    formData.append("file", item.file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      setUploadingItems(prev => prev.map(u => 
        u.id === item.id ? { ...u, status: 'success', progress: 100, tags: { ...u.tags, image_url: data.url, cloudinary_public_id: data.public_id } } : u
      ));
    } catch (e) {
      setUploadingItems(prev => prev.map(u => u.id === item.id ? { ...u, status: 'error' } : u));
    }
  };

  const handleTagChange = (id: string, field: string, value: any) => {
    setUploadingItems(prev => prev.map(u => u.id === id ? { ...u, tags: { ...u.tags, [field]: value } } : u));
  };

  const toggleMultiSelect = (id: string, field: 'season' | 'occasion_tags', value: string) => {
    setUploadingItems(prev => prev.map(u => {
      if (u.id !== id) return u;
      const current = (u.tags?.[field] as string[]) || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
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
          body: JSON.stringify({ user_id: user.uid, ...item.tags }),
        })
      ));
      setShowUploadModal(false);
      setUploadingItems([]);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item?")) return;
    try {
      await fetch(`/api/wardrobe?id=${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) { console.error(e); }
  };

  const runAnalysis = async () => {
    if (!user?.uid || items.length === 0) return;
    setAnalysisLoading(true);
    setAnalysisData(null);
    try {
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
      setTimeout(() => { document.getElementById('analysis-results')?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } catch (e) { console.error(e); } finally { setAnalysisLoading(false); }
  };

  const filteredItems = items.filter(item => {
    const matchesCat = filter === "All" || item.category === filter;
    const matchesSeason = seasonFilter === "All" || item.season.includes(seasonFilter) || item.season.includes("All Season");
    return matchesCat && matchesSeason;
  });

  return (
    <div className="animate-fade-in max-w-[1200px] mx-auto space-y-10 pb-20">
      {/* Hero Section */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#7C3AED] to-[#EC4899] p-8 md:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Wardrobe Intelligence
          </h1>
          <p className="text-white/90 text-lg mb-8 font-medium">
            Analyze your collection, discover style gaps, and get personalized recommendations from your own closet.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3.5 bg-white text-[#7C3AED] rounded-2xl font-bold hover:bg-[#F3F4FF] transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" /> Bulk Upload
            </button>
            <button
              onClick={runAnalysis}
              disabled={analysisLoading || items.length === 0}
              className="px-8 py-3.5 bg-black/20 text-white border border-white/30 backdrop-blur-md rounded-2xl font-bold hover:bg-black/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {analysisLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Deep Analysis
            </button>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
        </div>
      </div>

      {/* Grid Header & Filters */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {["All", ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all whitespace-nowrap ${
                  filter === cat ? "bg-[#7C3AED] text-white border-transparent" : "bg-white text-[#6B7280] border-[#E2E4F0] hover:border-[#7C3AED]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <select 
            value={seasonFilter} 
            onChange={e => setSeasonFilter(e.target.value)}
            className="w-40"
          >
            <option value="All">All Seasons</option>
            {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Results Analysis */}
        <div id="analysis-results">
          {analysisData && <WardrobeAnalysisResults data={analysisData} wardrobeItems={items} />}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED]" />
            <p className="text-[#6B7280] font-medium">Loading collection...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card text-center py-20 border-dashed">
            <ShoppingBag className="w-12 h-12 text-[#E2E4F0] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A2E]">No items found</h3>
            <p className="text-[#6B7280]">Start uploading your clothes to get AI styling advice.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative card overflow-hidden border-[#E2E4F0] hover:border-[#7C3AED]">
                <div className="relative aspect-[3/4] -m-6 mb-4 overflow-hidden">
                  <Image src={item.image_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-4 flex items-end">
                    <button onClick={() => handleDelete(item.id)} className="w-full py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg">Delete</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#1A1A2E] truncate text-sm">{item.name}</h4>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 bg-[#F3F4FF] text-[#7C3AED] text-[10px] font-bold rounded-lg border border-[#E2E4F0]">{item.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-white border border-[#E2E4F0] rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[#E2E4F0] flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tag Your Collection</h2>
              <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-full bg-[#F3F4FF] flex items-center justify-center hover:bg-[#E2E4F0] transition-colors">
                <X className="w-6 h-6 text-[#1A1A2E]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {uploadingItems.map((item) => (
                <div key={item.id} className="flex flex-col lg:flex-row gap-8 bg-[#F8F9FF] p-6 rounded-3xl border border-[#E2E4F0]">
                  <div className="w-full lg:w-40 aspect-square relative rounded-2xl overflow-hidden shrink-0 border border-[#E2E4F0] shadow-sm">
                    <Image src={item.preview} alt="Preview" fill className="object-cover" />
                    {item.status === 'uploading' && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" /></div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <span className="section-label">Item Name</span>
                        <input value={item.tags?.name} onChange={e => handleTagChange(item.id, 'name', e.target.value)} />
                      </div>
                      <div>
                        <span className="section-label">Category</span>
                        <select value={item.tags?.category} onChange={e => handleTagChange(item.id, 'category', e.target.value)}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <span className="section-label">Fabric</span>
                          <select value={item.tags?.fabric} onChange={e => handleTagChange(item.id, 'fabric', e.target.value)}>
                            {FABRICS.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </div>
                        <div className="w-16">
                          <span className="section-label">Color</span>
                          <input type="color" value={item.tags?.color} onChange={e => handleTagChange(item.id, 'color', e.target.value)} className="h-[46px] p-1" />
                        </div>
                      </div>
                      <div>
                        <span className="section-label">Seasons</span>
                        <div className="flex flex-wrap gap-1.5">
                          {SEASONS.map(s => (
                            <button key={s} onClick={() => toggleMultiSelect(item.id, 'season', s)} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${item.tags?.season?.includes(s) ? "bg-[#1A1A2E] text-white" : "bg-white text-[#9CA3AF] border-[#E2E4F0]"}`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[#E2E4F0] bg-white flex justify-between items-center">
              <span className="text-[#6B7280] text-sm font-semibold">
                {uploadingItems.filter(i => i.status === 'success').length} ready
              </span>
              <div className="flex gap-3">
                <button onClick={() => setShowUploadModal(false)} className="btn-secondary py-2.5">Cancel</button>
                <button onClick={saveAll} disabled={uploadingItems.some(i => i.status === 'uploading')} className="btn-primary py-2.5 px-8">Save Collection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
