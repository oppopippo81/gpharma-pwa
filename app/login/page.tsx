'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  const handleSignUp = async () => {
    // Controllo campi vuoti
    if (!email || !password) {
      alert("Per favore inserisci email e password!")
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      alert('Registrazione effettuata! Ora puoi fare il login.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
        
        {/* Banner Copertina */}
        <div className="h-32 w-full relative bg-gray-100">
          <img 
            src="/banner.jpg" 
            alt="Copertina" 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center -mt-12 mb-6 relative z-10">
            <div className="bg-white p-2 rounded-full shadow-md">
              <img src="/logo.jpg" alt="Logo" className="h-16 w-16 object-contain rounded-full bg-white" />
            </div>
          </div>

          <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Accedi a gpharma</h2>
          
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="nome@esempio.com"
              />
            </div>
            
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg shadow-green-100 transition hover:bg-green-700 hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? '...' : 'Accedi'}
              </button>
              <button
                onClick={handleSignUp}
                disabled={loading}
                className="flex-1 rounded-xl border-2 border-green-600 bg-white py-3 font-bold text-green-700 transition hover:bg-green-50"
              >
                Registrati
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}