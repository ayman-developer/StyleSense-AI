"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Upload, Trash2, Loader2, Plus, X, Filter } from "lucide-react";
import Image from "next/image";

type WardrobeItem = {
  id: string;
  image_url: string;
  category: string;
  color: string;
  season: string;
  occasion_tags: string[];
  times_worn: number;
};

const CATEGORIES = ["All", "Top", "Bottom", "Footwear", "Accessory", "Outerwear"];
const SEASONS = ["Summer", "Winter", "Monsoon", "All Season"];
const OCCASIONS = ["Casual", "Office", "Formal", "Party", "Gym", "Travel"];

export default function WardrobePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload form state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Top");
  const [color, setColor] = useState("");
  const [season, setSeason] = useState("All Season");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

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

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setShowUpload(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFileSelect(file);
  };

  const toggleOccasion = (o: string) => {
    setSelectedOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.uid) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url, public_id } = await uploadRes.json();

      await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.uid, image_url: url, cloudinary_public_id: public_id,
          category, color, season, occasion_tags: selectedOccasions,
        }),
      });

      setShowUpload(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      setColor("");
      setSelectedOccasions([]);
      fetchItems();
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from your wardrobe?")) return;
    try {
      await fetch(`/api/wardrobe?id=${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === "All" ? items : items.filter(i => i.category === filter);

  const categoryColors: Record<string, string> = {
    Top: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Bottom: "bg-green-500/20 text-green-400 border-green-500/30",
    Footwear: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Accessory: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Outerwear: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">My Wardrobe</h1>
          <p className="text-zinc-400">{items.length} items in your collection</p>
        </div>
        <button
          onClick={() => { setShowUpload(true); setPreviewUrl(null); setSelectedFile(null); }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold text-white hover:from-purple-400 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
        >
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {CATEGORIES.slice(1).map(cat => {
          const count = items.filter(i => i.category === cat).length;
          return (
            <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-zinc-500 mt-1">{cat}s</div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-zinc-500" />
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === cat
                ? "bg-white text-black border-white"
                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Add to Wardrobe</h2>
              <button onClick={() => setShowUpload(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {!previewUrl ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-purple-500 bg-purple-500/10" : "border-zinc-700 hover:border-zinc-500"}`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
                <p className="text-zinc-400 font-medium">Drop image here or click to upload</p>
                <p className="text-zinc-600 text-sm mt-1">JPG, PNG, WEBP supported</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-zinc-800">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute top-2 right-2 bg-black/60 rounded-full p-1"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Category *</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-sm">
                      {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Color</label>
                    <input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Navy Blue" className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 mb-1 block">Season</label>
                    <div className="flex gap-2 flex-wrap">
                      {SEASONS.map(s => (
                        <button key={s} onClick={() => setSeason(s)} className={`px-3 py-1 rounded-full text-xs border transition-all ${season === s ? "bg-white text-black border-white" : "border-zinc-700 text-zinc-400"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-500 mb-1 block">Occasion Tags</label>
                    <div className="flex gap-2 flex-wrap">
                      {OCCASIONS.map(o => (
                        <button key={o} onClick={() => toggleOccasion(o)} className={`px-3 py-1 rounded-full text-xs border transition-all ${selectedOccasions.includes(o) ? "bg-purple-600 text-white border-purple-600" : "border-zinc-700 text-zinc-400"}`}>{o}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={handleUpload} disabled={uploading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Save to Wardrobe</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Upload className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 font-medium">No {filter === "All" ? "" : filter + "s"} in your wardrobe yet</p>
          <p className="text-zinc-600 text-sm mt-1">Click &quot;Add Item&quot; to start building your collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all">
              <div className="relative aspect-square">
                <Image src={item.image_url} alt={item.category} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 bg-black/70 text-red-400 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5 space-y-1.5">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${categoryColors[item.category] || "bg-zinc-700 text-zinc-300"}`}>
                  {item.category}
                </span>
                {item.color && <p className="text-xs text-zinc-500 truncate">{item.color}</p>}
                {item.season && <p className="text-[10px] text-zinc-600">{item.season}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
