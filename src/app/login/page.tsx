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
    // Hard timeout — show login button after 3 seconds NO MATTER WHAT
    const timer = setTimeout(() => setReady(true), 3000)

    const unsub = onAuthStateChanged(auth, (user) => {
      clearTimeout(timer)
      if (user) {
        router.replace('/dashboard')
      } else {
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
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          name: user.displayName,
          email: user.email,
          avatar_url: user.photoURL,
        }),
      })
      router.replace('/dashboard')
    } catch (err: any) {
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
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-sm text-center shadow-xl">
        <h1 className="text-3xl font-bold text-purple-500 mb-2">StyleSense AI</h1>
        <p className="text-gray-400 mb-6 text-sm">Sign in to your AI stylist</p>
        {error && (
          <p className="text-red-400 text-xs mb-4 bg-red-950 px-3 py-2 rounded-lg">{error}</p>
        )}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl 
                     hover:bg-gray-100 transition disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              Opening Google...
            </>
          ) : (
            '→ Continue with Google'
          )}
        </button>
      </div>
    </div>
  )
}
