'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    console.log("Login Page: Initializing auth check...");
    
    // Hard timeout — show login button after 3 seconds NO MATTER WHAT
    const timer = setTimeout(() => {
      console.log("Login Page: 3s timeout reached, forcing ready state");
      setReady(true)
    }, 3000)

    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log("Login Page: Auth state changed. User:", user ? "Logged In" : "Logged Out");
      
      if (user) {
        try {
          console.log("Login Page: Existing session found, performing background sync...");
          // Ensure cookie is set even for auto-login to prevent middleware loops
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebase_uid: user.uid,
              name: user.displayName,
              email: user.email,
              avatar_url: user.photoURL,
            }),
          });
          console.log("Login Page: Sync complete, navigating to dashboard");
          router.replace('/dashboard')
        } catch (syncErr) {
          console.error("Login Page: Auto-sync failed:", syncErr);
          setReady(true);
        }
      } else {
        clearTimeout(timer)
        setReady(true)
      }
    }, (authErr) => {
      console.error("Login Page: Auth state listener error:", authErr);
      clearTimeout(timer);
      setReady(true);
    })

    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [router])

  const login = async () => {
    setLoading(true)
    setError('')
    console.log("Login Page: Starting Google sign-in...");
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("Login Page: Sign-in successful, syncing user...");
      
      const syncRes = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          name: user.displayName,
          email: user.email,
          avatar_url: user.photoURL,
        }),
      })

      if (!syncRes.ok) throw new Error("Sync API failed");

      console.log("Login Page: User synced, redirecting...");
      router.replace('/dashboard')
    } catch (err: any) {
      console.error("Login Page: Login error:", err);
      setError(err?.message || 'Login failed. Try again.')
      setLoading(false)
    }
  }

  // Show spinner while initializing (max 3 seconds)
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-purple-500 mb-4" />
        <p className="text-gray-400 text-sm">Initializing StyleSense AI...</p>
      </div>
    )
  }

  // Show login UI after ready
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-sm text-center shadow-xl border border-zinc-800 animate-in fade-in zoom-in duration-500">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">StyleSense AI</h1>
        <p className="text-gray-400 mb-6 text-sm">Your Personal AI Stylist</p>
        
        {error && (
          <p className="text-red-400 text-xs mb-4 bg-red-950/50 px-3 py-2 rounded-lg border border-red-900/50">{error}</p>
        )}
        
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-4 rounded-xl 
                     hover:bg-gray-100 transition active:scale-95 disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              Please wait...
            </>
          ) : (
            'Continue with Google'
          )}
        </button>
        <p className="mt-6 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold opacity-50">
          Powered by StyleSense AI
        </p>
      </div>
    </div>
  )
}
