"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Loader2 } from "lucide-react";


type WardrobeItem = {
  id: string;
  image_url: string;
  category: string;
  color: string;
  season: string;
  occasion_tags: string[];
};

export default function WardrobePage() {
  const { user } = useAuth();
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState("All");

  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("Top");
  const [color, setColor] = useState("Black");
  const [season, setSeason] = useState("All");
  const [occasion, setOccasion] = useState("Casual");

  useEffect(() => {
    if (user?.uid) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/wardrobe?userId=${user.uid}`);
      if (!res.ok) throw new Error("Failed to fetch wardrobe data");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user?.uid) return;
    setUploading(true);

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const { url, public_id } = await uploadRes.json();

      // 2. Save to Supabase
      const newItem = {
        user_id: user.uid,
        image_url: url,
        cloudinary_public_id: public_id,
        category,
        color,
        season,
        occasion_tags: [occasion],
      };

      const dbRes = await fetch("/api/wardrobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      const savedItem = await dbRes.json();
      setItems([savedItem, ...items]);
      setFile(null); // reset
    } catch (e) {
      console.error("Upload error", e);
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = filter === "All" ? items : items.filter((i) => i.category === filter);
  const categories = ["All", "Top", "Bottom", "Outerwear", "Shoes", "Accessories"];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">My Wardrobe</h1>
          <p className="text-zinc-400 text-lg">Manage your digital closet.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Upload Form */}
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-xl font-semibold mb-4">Add Item</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white">
                <option>Top</option>
                <option>Bottom</option>
                <option>Outerwear</option>
                <option>Shoes</option>
                <option>Accessories</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Color</label>
              <input 
                type="text" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white"
                placeholder="e.g. Black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Season</label>
              <select value={season} onChange={(e) => setSeason(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white">
                <option>All</option>
                <option>Summer</option>
                <option>Winter</option>
                <option>Fall</option>
                <option>Spring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Occasion</label>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-white">
                <option>Casual</option>
                <option>Office</option>
                <option>Party</option>
                <option>Formal</option>
                <option>Gym</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {uploading ? "Uploading..." : "Add to Closet"}
            </button>
          </form>
        </div>

        {/* Grid */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-4 py-2 rounded-full whitespace-nowrap border text-sm transition-all ${
                  filter === c ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-500"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
              No items found. Add some clothes to your wardrobe!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                  <div className="relative aspect-[3/4] w-full">
                    {/* Using a regular img tag to avoid domain configuration issues with Next.js Image component */}
                    <img 
                      src={item.image_url} 
                      alt={item.category} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="font-medium text-white">{item.color} {item.category}</p>
                      <p className="text-xs text-zinc-300">{item.season} • {item.occasion_tags.join(", ")}</p>
                    </div>
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
