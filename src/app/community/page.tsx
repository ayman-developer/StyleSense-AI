"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Heart, MessageCircle, Image as ImageIcon, Loader2 } from "lucide-react";

type Post = {
  id: string;
  user_id: string;
  image_url: string;
  occasion_tag: string;
  weather_tag: string;
  caption: string;
  likes_count: number;
  users: {
    name: string;
    avatar_url: string;
  };
};

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // New post state
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [weather, setWeather] = useState("Sunny");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/community");
      if (!res.ok) throw new Error("Failed to fetch community posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user?.uid) return;
    setUploading(true);

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();

      // 2. Create post
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          imageUrl: url,
          occasionTag: occasion,
          weatherTag: weather,
          caption
        }),
      });
      const newPost = await res.json();
      
      // Opt UI update
      fetchPosts();
      
      setFile(null);
      setCaption("");
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Style Community</h1>
        <p className="text-zinc-400 text-lg">Get inspired by what others are wearing today.</p>
      </header>

      {/* Create Post */}
      {user && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl mb-10">
          <form onSubmit={handlePost} className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                {user.displayName?.[0] || "U"}
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Share your Outfit of the Day..."
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:border-zinc-600 outline-none resize-none"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    className="block text-sm text-zinc-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                  />
                  <select value={occasion} onChange={e => setOccasion(e.target.value)} className="bg-zinc-800 rounded-full px-3 py-1 text-xs text-white outline-none">
                    <option>Casual</option><option>Office</option><option>Party</option>
                  </select>
                  <select value={weather} onChange={e => setWeather(e.target.value)} className="bg-zinc-800 rounded-full px-3 py-1 text-xs text-white outline-none">
                    <option>Sunny</option><option>Cloudy</option><option>Rainy</option><option>Cold</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-6 py-2 rounded-full font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-zinc-200"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                Post OOTD
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-500 mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">No posts yet. Be the first to share your style!</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl max-w-2xl mx-auto">
              {/* Header */}
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                  {post.users?.avatar_url ? (
                    <img src={post.users.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
                      {post.users?.name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{post.users?.name || "Anonymous Style Icon"}</h3>
                  <div className="flex gap-2 text-xs text-zinc-500 mt-0.5">
                    <span>{post.occasion_tag}</span> • <span>{post.weather_tag}</span>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-square w-full bg-black">
                <img src={post.image_url} alt="OOTD" className="w-full h-full object-cover" />
              </div>

              {/* Actions & Caption */}
              <div className="p-4">
                <div className="flex gap-4 mb-3">
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-pink-500 transition-colors">
                    <Heart className="w-6 h-6" /> <span className="text-sm font-medium">{post.likes_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
                {post.caption && (
                  <p className="text-sm text-zinc-300">
                    <span className="font-semibold text-white mr-2">{post.users?.name || "User"}</span>
                    {post.caption}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
