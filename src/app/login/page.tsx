"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import {
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if already logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard");
      } else {
        setChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
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
          throw new Error("Failed to sync account");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      setSigningIn(false);
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
        <p className="text-zinc-400 animate-pulse">Initializing StyleSense AI...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/95 text-white p-4">
      <div className="p-8 space-y-6 bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 text-center max-w-sm w-full animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            StyleSense AI
          </h1>
          <p className="text-zinc-400">Your Personal AI Stylist</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <Button 
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className="w-full bg-white text-black hover:bg-zinc-200 transition-all py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-white/10 active:scale-95"
        >
          {signingIn ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          {signingIn ? "Please wait..." : "Continue with Google"}
        </Button>

        <p className="text-xs text-zinc-500 pt-4">
          By continuing, you agree to StyleSense AI's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
