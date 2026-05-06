"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save profile to Supabase on first login
      const { error } = await supabase.from('users').upsert({
        id: user.uid,
        email: user.email,
        name: user.displayName,
        avatar: user.photoURL,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (error) console.error("Error syncing user to Supabase:", error);
      
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/95 text-white">
      <div className="p-8 space-y-6 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 text-center max-w-sm w-full">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          StyleSense AI
        </h1>
        <p className="text-zinc-400">Sign in to your AI stylist</p>
        
        <Button 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white text-black hover:bg-zinc-200 transition-colors py-6 text-lg font-semibold"
        >
          <LogIn className="mr-2 h-5 w-5" />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}
