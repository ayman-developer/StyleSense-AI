"use client";

import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle redirect result on mount
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncUser(result.user);
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        setLoading(false);
      });
  }, [router]);

  const syncUser = async (user: any) => {
    try {
      const { error } = await supabase.from('users').upsert({
        firebase_uid: user.uid,
        email: user.email,
        name: user.displayName,
        avatar_url: user.photoURL,
        created_at: new Date().toISOString()
      }, { onConflict: 'firebase_uid' });
      
      if (error) {
        throw new Error(`Supabase sync failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error syncing user to Supabase:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Sign in error:", error);
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
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          {loading ? "Please wait..." : "Continue with Google"}
        </Button>
      </div>
    </div>
  );
}
