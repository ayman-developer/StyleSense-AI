"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Handle redirect result after Google login
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const syncRes = await fetch("/api/auth/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebase_uid: result.user.uid,
              name: result.user.displayName,
              email: result.user.email,
              avatar_url: result.user.photoURL,
            }),
          });
          
          if (syncRes.ok) {
            router.push("/dashboard");
          } else {
            console.error("Sync failed");
            setLoading(false);
          }
        } else {
          // 2. If no redirect result, check if already logged in
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              router.push("/dashboard");
            } else {
              setLoading(false);
            }
          });
          return () => unsubscribe();
        }
      })
      .catch((error) => {
        console.error("Redirect error:", error);
        setLoading(false);
      });
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
      // Redirect happens automatically after page reload
    } catch (error) {
      console.error("Login error:", error);
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
          onClick={handleGoogleLogin}
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
