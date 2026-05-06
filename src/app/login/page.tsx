'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Loader2, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 3000)

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebase_uid: user.uid,
              name: user.displayName,
              email: user.email,
              avatar_url: user.photoURL,
            }),
          });
          
          if (res.ok) {
            router.replace('/dashboard')
          } else {
            setReady(true);
          }
        } catch (syncErr) {
          setReady(true);
        }
      } else {
        clearTimeout(timer)
        setReady(true)
      }
    })

    return () => {
      clearTimeout(timer)
      unsub()
    }
  }, [router])

  const login = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
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

      if (!syncRes.ok) throw new Error("Sync failed");
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed. Try again.')
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FF]">
        <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED] mb-4" />
        <p className="text-[#6B7280] font-medium animate-pulse">Initializing StyleSense AI...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#EEF2FF] to-[#FAF5FF] px-4">
      <div className="bg-white rounded-[32px] p-10 w-full max-w-md text-center shadow-2xl border border-[#E2E4F0] animate-in fade-in zoom-in duration-700">
        <div className="w-16 h-16 bg-[#7C3AED]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-[#7C3AED]" />
        </div>
        
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent mb-3">StyleSense AI</h1>
        <p className="text-[#6B7280] font-medium mb-10">Your Premium Personal AI Stylist</p>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-[#1A1A2E] text-white font-bold py-4 rounded-2xl 
                     hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 
                     flex items-center justify-center gap-3 shadow-xl shadow-[#1A1A2E]/20"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
        
        <p className="mt-10 text-xs text-[#9CA3AF] font-bold uppercase tracking-[0.2em]">
          Elegance Powered by AI
        </p>
      </div>
    </div>
  )
}

function AlertCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  )
}
