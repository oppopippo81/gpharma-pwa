'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, LogOut, PlusCircle, Search, Package } from 'lucide-react'

// Definiamo il tipo Ordine
type Order = {
  id: string
  created_at: string
  status: string
  notes: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<string>('')
  const [orders, setOrders] = useState<Order[]>([]) // Stato per gli ordini
  const router = useRouter()

  // 1. Controllo Utente + Scarico Ordini
  useEffect(() => {
    const initData = async () => {
      // Check User
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setUser(session.user)
        
        // Scarica gli ordini di QUESTO utente
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id) // Filtra solo i miei
          .order('created_at', { ascending: false }) // Dal più recente

        if (ordersData) setOrders(ordersData)
      }
      setLoading(false)
    }

    initData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
  }

  // Helper per le etichette colorate
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'In Attesa', color: 'bg-yellow-100 text-yellow-800' }
      case 'accepted': return { label: 'Accettato', color: 'bg-blue-100 text-blue-800' }
      case 'ready': return { label: 'Rider in arrivo', color: 'bg-indigo-100 text-indigo-800' }
      case 'delivered': return { label: 'Consegnato', color: 'bg-green-100 text-green-800' }
      case 'rejected': return { label: 'Rifiutato', color: 'bg-red-100 text-red-800' }
      default: return { label: status, color: 'bg-gray-100' }
    }
  }

  // --- VISTA 1: CARICAMENTO ---
  if (loading) return <div className="flex h-screen items-center justify-center">Caricamento...</div>

  // --- VISTA 2: UTENTE LOGGATO ---
  if (user) {
    return (
      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <div>
            <p className="text-xs text-gray-500">Bentornato,</p>
            <p className="text-sm font-bold text-gray-800 truncate w-32">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
            <LogOut size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Card Geolocalizzazione */}
          <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-2">Trova Farmacia</h2>
            <p className="text-green-100 text-sm mb-4">Usa il GPS per vedere chi consegna da te.</p>
            <button 
              onClick={() => alert('Funzione Demo: Posizione acquisita!')}
              className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-full font-bold text-sm hover:bg-green-50 transition w-full justify-center"
            >
              <MapPin size={18} />
              Usa mia posizione
            </button>
          </div>

          {/* Azioni Rapide */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => router.push('/search')}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-green-500 transition"
            >
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <Search size={24} />
              </div>
              <span className="font-medium text-sm text-gray-700">Cerca Farmaco</span>
            </button>

            <button 
              onClick={() => router.push('/upload')}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-green-500 transition"
            >
              <div className="bg-orange-100 p-3 rounded-full text-orange-600">
                <PlusCircle size={24} />
              </div>
              <span className="font-medium text-sm text-gray-700">Carica Ricetta</span>
            </button>
          </div>

          {/* LISTA ORDINI REALI */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package size={18} />
              I tuoi ordini
            </h3>
            
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-400">
                Non hai ancora fatto ordini.
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const statusInfo = getStatusLabel(order.status)
                  return (
                    <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-medium text-gray-700 mt-1 truncate w-40">
                          {order.notes}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-300">#{order.id.slice(0,4)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  // --- VISTA 3: OSPITE ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white text-gray-800">
      <h1 className="text-4xl font-bold text-green-600 mb-2">gpharma</h1>
      <p className="text-lg mb-8 text-center text-gray-500">La tua farmacia a domicilio.</p>
      <div className="grid gap-4 w-full max-w-xs">
        <Link href="/login" className="bg-green-600 text-white text-center py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition">
          Accedi o Registrati
        </Link>
      </div>
      <p className="mt-10 text-xs text-gray-400">Web App v1.0</p>
    </main>
  )
}